# Sprint 1 — Server Foundations (tasks-as-database) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the complete data model and GraphQL API for per-team secondary task statuses — `TaskSecondaryStatus` table, `Task.secondaryStatusId`, CRUD mutations on the TEAM channel, `createTask`/`updateTask`/`changeTaskTeam` integration, and the `updateTask` null-`userId` unassign fix — server-only, zero UI change.

**Architecture:** New serial-PK config table FK'd from `Task` with `ON DELETE SET NULL` (safe-delete = schema behavior). SDL-first GraphQL: one typeDef file per mutation, `*Success` types resolved from thin `{taskSecondaryStatusId, teamId}` sources via dataloaders, publishes on `SubscriptionChannel.TEAM` after all writes. Authorization in graphql-shield `permissions.ts`.

**Tech Stack:** Kysely migrations + kysely-codegen, GraphQL codegen (SDL-first), graphql-shield, Jest 29 (`__tests__/*.test.ts`, real Postgres/Redis + running dev server for integration tests).

**Spec:** `docs/superpowers/specs/2026-07-14-tasks-as-database-design.md` (§3.1, §3.2, §3.5, §6.1, §6.2, Sprint 1 row of §7). Decisions referenced as "decision N" come from spec §2.

## Global Constraints

- **pnpm only** — never yarn/npm.
- **Never cast `as any`** (narrow object casts like `(e as {code?: string})` are fine).
- Migrations: `Kysely<any>`, idempotent (`ifNotExists`/`ifExists`), ISO-timestamp filename, frozen in time.
- All `sortOrder` values are **`double precision` floats** (spec decision 7 — no lexicographic strings).
- Every new Mutation field carries `@scope(name: TASKS_WRITE)`; schema build throws without it.
- New mutations return `<Name>Success!` directly and `throw new GraphQLError(...)` on failure (no ErrorPayload unions). `createTask`/`updateTask`/`changeTaskTeam` keep their existing legacy payload shapes.
- Publishes happen **after all DB writes**; `const operationId = dataLoader.share()` at top, `publish(...)` at bottom.
- Resolvers never query PG for reads — dataloaders only. Direct `getKysely()` is for writes and count-style checks.
- `permissions.ts` Mutation entries are **alphabetical**.
- Test files MUST be at `**/__tests__/<name>.test.ts` (jest `testRegex`) — a `.test.ts` outside `__tests__/` silently never runs.
- **Integration tests need the dev stack running** (`pnpm dev` in a separate terminal: server + Postgres + Redis). After SDL changes, pm2 watch usually rebuilds; if a new field still errors "Cannot query field" after implementation, restart `pnpm dev`.
- After editing any `.graphql` typeDef or `codegen.json`: run `pnpm codegen` (regenerates `resolverTypes`). Typecheck: `npx tsgo -p packages/server/tsconfig.json --noEmit`. Lint: `pnpm exec biome check --write <files>`.
- Run a single server test file from repo root: `pnpm test:server <pattern>` (jest `--runInBand`).

## File Structure

**Create:**
- `packages/server/postgres/migrations/2026-07-14T00:00:00.000Z_addTaskSecondaryStatus.ts` — DDL
- `packages/client/shared/gqlIds/TaskSecondaryStatusId.ts` — `taskSecondaryStatus:<int>` join/split
- `packages/server/graphql/public/typeDefs/TaskSecondaryStatus.graphql` — object type
- `packages/server/graphql/public/types/TaskSecondaryStatus.ts` — id/team resolvers
- `packages/server/graphql/public/mutations/helpers/validateTaskSecondaryStatus.ts` — pure validator + loader wrapper
- `packages/server/graphql/public/mutations/helpers/__tests__/validateTaskSecondaryStatus.test.ts`
- `packages/server/graphql/public/typeDefs/{addTaskSecondaryStatus,renameTaskSecondaryStatus,moveTaskSecondaryStatus,removeTaskSecondaryStatus}.graphql`
- `packages/server/graphql/public/mutations/{addTaskSecondaryStatus,renameTaskSecondaryStatus,moveTaskSecondaryStatus,removeTaskSecondaryStatus}.ts`
- `packages/server/graphql/public/types/{Add,Rename,Move,Remove}TaskSecondaryStatusSuccess.ts`
- `packages/server/graphql/public/rules/isTeamMemberOfTaskSecondaryStatus.ts` — new shield rule (decodes composite id; flag in PR)
- `packages/server/dataloader/__tests__/taskSecondaryStatuses.test.ts`
- `packages/server/__tests__/taskSecondaryStatusCrud.test.ts`
- `packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts`

**Modify:**
- `packages/server/postgres/select.ts` — `selectTaskSecondaryStatuses()`; add `secondaryStatusId` to `selectTasks()` (line ~275)
- `packages/server/postgres/types/index.d.ts` — `TaskSecondaryStatus` type export
- `codegen.json` — mappers for `TaskSecondaryStatus` + 4 Success types
- `packages/server/dataloader/primaryKeyLoaderMakers.ts` — `taskSecondaryStatuses`
- `packages/server/dataloader/foreignKeyLoaderMakers.ts` — `taskSecondaryStatusesByTeamId`
- `packages/server/graphql/public/typeDefs/Team.graphql` — `secondaryStatuses` field
- `packages/server/graphql/public/types/Team.ts` — resolver
- `packages/server/graphql/public/typeDefs/Task.graphql` — `secondaryStatus` field
- `packages/server/graphql/public/types/Task.ts` — resolver
- `packages/server/graphql/public/typeDefs/TeamSubscriptionPayload.graphql` — 4 new fields
- `packages/server/graphql/public/typeDefs/CreateTaskInput.graphql`, `UpdateTaskInput.graphql` — `secondaryStatusId: ID`
- `packages/server/graphql/public/mutations/createTask.ts`, `updateTask.ts` (unassign fix at line 55 + secondary support), `changeTaskTeam.ts` (clear on move)
- `packages/server/graphql/public/permissions.ts` — 4 entries

**Why not `pnpm newMutation`:** the scaffolder appends `extend union TeamSubscriptionPayload = ...` (invalid — `TeamSubscriptionPayload` is a flat *type* with `fieldName` + field-per-payload), inserts an unimported `isFIXME` into permissions.ts, and writes legacy-pattern client files that must be reverted. Manual authoring from the templates below is deterministic.

---

### Task 1: Branch, cleanup, migration, generated types

**Files:**
- Create: `packages/server/postgres/migrations/2026-07-14T00:00:00.000Z_addTaskSecondaryStatus.ts`
- Regenerated: `packages/server/postgres/types/pg.d.ts`

**Interfaces:**
- Produces: PG table `TaskSecondaryStatus(id serial PK, teamId varchar(100) FK CASCADE, status "TaskStatusEnum", label varchar(100), sortOrder double precision, createdAt, updatedAt)`; unique index on `(teamId, status, lower(label))`; `Task.secondaryStatusId integer` FK `SET NULL`; indexes `idx_Task_teamId_status`, partial `idx_Task_secondaryStatusId`. In `pg.d.ts`: `interface TaskSecondaryStatus` with `id: Generated<number>`, and `Task.secondaryStatusId: number | null`.

- [ ] **Step 1: Branch + stray-file cleanup**

```bash
cd /Users/jrhusney/Source/Parabol/parabol.git
git checkout feat/tasks-as-database && git pull --ff-only 2>/dev/null || true
git checkout -b s1-server-foundations
rm -f publishedDataloader1.json publishedDataloader2.json
```

(The two JSON files are untracked debug dumps from the publish-after-write dev assertion — delete only, nothing to commit for them.)

- [ ] **Step 2: Write the migration**

```typescript
// packages/server/postgres/migrations/2026-07-14T00:00:00.000Z_addTaskSecondaryStatus.ts
import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('TaskSecondaryStatus')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('teamId', 'varchar(100)', (col) =>
      col.references('Team.id').onDelete('cascade').notNull()
    )
    // the parent primary status; a secondary always belongs to exactly one primary band
    .addColumn('status', sql`"TaskStatusEnum"`, (col) => col.notNull())
    .addColumn('label', 'varchar(100)', (col) => col.notNull())
    .addColumn('sortOrder', 'double precision', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_TaskSecondaryStatus_teamId_status_lowerLabel"
    ON "TaskSecondaryStatus" ("teamId", "status", lower("label"))
  `.execute(db)
  await sql`
    CREATE TRIGGER "update_TaskSecondaryStatus_updatedAt"
    BEFORE UPDATE ON "TaskSecondaryStatus"
    FOR EACH ROW EXECUTE FUNCTION "set_updatedAt"()
  `.execute(db)
  await db.schema
    .alterTable('Task')
    .addColumn('secondaryStatusId', 'integer', (col) =>
      col.references('TaskSecondaryStatus.id').onDelete('set null')
    )
    .execute()
  await db.schema
    .createIndex('idx_Task_teamId_status')
    .ifNotExists()
    .on('Task')
    .columns(['teamId', 'status'])
    .execute()
  await sql`
    CREATE INDEX IF NOT EXISTS "idx_Task_secondaryStatusId"
    ON "Task" ("secondaryStatusId") WHERE "secondaryStatusId" IS NOT NULL
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Task').dropColumn('secondaryStatusId').execute()
  await db.schema.dropIndex('idx_Task_teamId_status').ifExists().execute()
  await db.schema.dropTable('TaskSecondaryStatus').ifExists().execute()
}
```

- [ ] **Step 3: Run the migration**

Run: `pnpm kysely migrate:latest`
Expected: output ends listing `2026-07-14T00:00:00.000Z_addTaskSecondaryStatus` as executed, no errors.

- [ ] **Step 4: Regenerate pg types and verify**

Run: `pnpm pg:generate`
Then: `grep -n "TaskSecondaryStatus" packages/server/postgres/types/pg.d.ts | head -5` and `grep -n "secondaryStatusId" packages/server/postgres/types/pg.d.ts`
Expected: `export interface TaskSecondaryStatus` with `id: Generated<number>`, `status: Taskstatusenum`, and `secondaryStatusId: number | null` inside `interface Task`.

- [ ] **Step 5: Commit**

```bash
git add packages/server/postgres/migrations/2026-07-14T00:00:00.000Z_addTaskSecondaryStatus.ts packages/server/postgres/types/pg.d.ts
git commit -m "feat(tasks-db): add TaskSecondaryStatus table + Task.secondaryStatusId"
```

---

### Task 2: Select helper, DB type, dataloaders

**Files:**
- Modify: `packages/server/postgres/select.ts` (selectTasks at ~line 275; add new helper near it)
- Modify: `packages/server/postgres/types/index.d.ts`
- Modify: `packages/server/dataloader/primaryKeyLoaderMakers.ts`
- Modify: `packages/server/dataloader/foreignKeyLoaderMakers.ts`
- Test: `packages/server/dataloader/__tests__/taskSecondaryStatuses.test.ts`

**Interfaces:**
- Consumes: Task 1's `TaskSecondaryStatus` table / pg.d.ts types.
- Produces: `selectTaskSecondaryStatuses()` (kysely select builder); type `TaskSecondaryStatus` from `postgres/types/index`; primary loader `dataLoader.get('taskSecondaryStatuses').load(id: number)`; FK loader `dataLoader.get('taskSecondaryStatusesByTeamId').load(teamId: string)` returning rows ordered by `(status, sortOrder)`. `selectTasks()` rows now include `secondaryStatusId: number | null`.

- [ ] **Step 1: Write the failing dataloader test**

```typescript
// packages/server/dataloader/__tests__/taskSecondaryStatuses.test.ts
import '../../../../scripts/webpack/utils/dotenv'
import getKysely from '../../postgres/getKysely'
import {createPGTables, truncatePGTables} from '../../__tests__/common'
import RootDataLoader from '../RootDataLoader'

const TEST_DB = 'taskSecondaryStatusesTest'

beforeAll(async () => {
  const pg = getKysely(TEST_DB)
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await createPGTables('TaskSecondaryStatus')
})

afterEach(async () => {
  await truncatePGTables('TaskSecondaryStatus')
})

afterAll(async () => {
  const pg = getKysely()
  await pg.schema.dropSchema(TEST_DB).cascade().execute()
  await pg.destroy()
})

// LIKE-clones drop FK constraints, so we can insert rows without real Team rows
const seed = async () => {
  const pg = getKysely()
  const rows = await pg
    .insertInto('TaskSecondaryStatus')
    .values([
      {teamId: 'teamA', status: 'active', label: 'In review', sortOrder: 2},
      {teamId: 'teamA', status: 'active', label: 'In progress', sortOrder: 1},
      {teamId: 'teamA', status: 'stuck', label: 'Blocked', sortOrder: 1},
      {teamId: 'teamB', status: 'active', label: 'In progress', sortOrder: 1}
    ])
    .returning('id')
    .execute()
  return rows.map(({id}) => id)
}

test('taskSecondaryStatuses primary loader loads by id', async () => {
  const [firstId] = await seed()
  const dataLoader = new RootDataLoader()
  const row = await dataLoader.get('taskSecondaryStatuses').load(firstId!)
  expect(row).toMatchObject({teamId: 'teamA', status: 'active', label: 'In review'})
})

test('taskSecondaryStatusesByTeamId returns team rows ordered by status then sortOrder', async () => {
  await seed()
  const dataLoader = new RootDataLoader()
  const rows = await dataLoader.get('taskSecondaryStatusesByTeamId').load('teamA')
  expect(rows.map(({label}) => label)).toEqual(['In progress', 'In review', 'Blocked'])
  expect(rows.every(({teamId}) => teamId === 'teamA')).toBe(true)
})

test('unique index rejects case-insensitive duplicate label per (team, status)', async () => {
  await seed()
  const pg = getKysely()
  await expect(
    pg
      .insertInto('TaskSecondaryStatus')
      .values({teamId: 'teamA', status: 'active', label: 'IN REVIEW', sortOrder: 9})
      .execute()
  ).rejects.toMatchObject({code: '23505'})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:server taskSecondaryStatuses`
Expected: FAIL — TS/type error: `'taskSecondaryStatuses'` is not a valid loader name (and `selectFrom('TaskSecondaryStatus')` compiles only if Task 1's pg:generate ran).

- [ ] **Step 3: Implement select helper + type + loaders**

In `packages/server/postgres/select.ts`, after `selectTasks` add:

```typescript
export const selectTaskSecondaryStatuses = () =>
  getKysely().selectFrom('TaskSecondaryStatus').selectAll()
```

In `selectTasks()`'s explicit column list (line ~275), add `'secondaryStatusId',` after `'plaintextContent',`.

In `packages/server/postgres/types/index.d.ts`, next to the `Task` export (line ~133) add (and add `selectTaskSecondaryStatuses` to the existing import from `../select`):

```typescript
export type TaskSecondaryStatus = ExtractTypeFromQueryBuilderSelect<
  typeof selectTaskSecondaryStatuses
>
```

In `packages/server/dataloader/primaryKeyLoaderMakers.ts` (import `selectTaskSecondaryStatuses` from `../postgres/select`; keep near the `tasks` loader):

```typescript
export const taskSecondaryStatuses = primaryKeyLoaderMaker((ids: readonly number[]) => {
  return selectTaskSecondaryStatuses().where('id', 'in', ids).execute()
})
```

In `packages/server/dataloader/foreignKeyLoaderMakers.ts`:

```typescript
export const taskSecondaryStatusesByTeamId = foreignKeyLoaderMaker(
  'taskSecondaryStatuses',
  'teamId',
  async (teamIds) => {
    return selectTaskSecondaryStatuses()
      .where('teamId', 'in', teamIds)
      .orderBy('status')
      .orderBy('sortOrder')
      .execute()
  }
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:server taskSecondaryStatuses`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck + lint + commit**

```bash
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check --write packages/server/postgres/select.ts packages/server/postgres/types/index.d.ts packages/server/dataloader/primaryKeyLoaderMakers.ts packages/server/dataloader/foreignKeyLoaderMakers.ts packages/server/dataloader/__tests__/taskSecondaryStatuses.test.ts
git add -A packages/server/postgres packages/server/dataloader
git commit -m "feat(tasks-db): TaskSecondaryStatus select helper + dataloaders"
```

---

### Task 3: GraphQL read surface (type, Team.secondaryStatuses, Task.secondaryStatus)

**Files:**
- Create: `packages/client/shared/gqlIds/TaskSecondaryStatusId.ts`
- Create: `packages/server/graphql/public/typeDefs/TaskSecondaryStatus.graphql`
- Create: `packages/server/graphql/public/types/TaskSecondaryStatus.ts`
- Modify: `packages/server/graphql/public/typeDefs/Team.graphql`, `types/Team.ts`, `typeDefs/Task.graphql`, `types/Task.ts`, `codegen.json`
- Test: `packages/server/__tests__/taskSecondaryStatusCrud.test.ts` (first test only)

**Interfaces:**
- Consumes: Task 2's loaders and `TaskSecondaryStatus` DB type.
- Produces: `TaskSecondaryStatusId = {join: (id: number) => string, split: (id: string) => number}` (format `taskSecondaryStatus:<int>`); GraphQL `TaskSecondaryStatus {id, teamId, team, status, label, sortOrder}`; `Team.secondaryStatuses: [TaskSecondaryStatus!]!`; `Task.secondaryStatus: TaskSecondaryStatus | null`. Later tasks import `TaskSecondaryStatusId` from `parabol-client/shared/gqlIds/TaskSecondaryStatusId`.

- [ ] **Step 1: Write the failing integration test** (dev stack must be running)

```typescript
// packages/server/__tests__/taskSecondaryStatusCrud.test.ts
import {sendPublic, signUp} from './common'

test('Team.secondaryStatuses is empty for a fresh team', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: `
      query TeamSecondaryStatuses {
        viewer {
          teams {
            id
            secondaryStatuses {
              id
              label
              status
              sortOrder
            }
          }
        }
      }
    `,
    cookie
  })
  expect(res.errors).toBeUndefined()
  const team = res.data.viewer.teams.find((t: {id: string}) => t.id === teamId)
  expect(team.secondaryStatuses).toEqual([])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:server taskSecondaryStatusCrud`
Expected: FAIL — GraphQL error `Cannot query field "secondaryStatuses" on type "Team"`.

- [ ] **Step 3: Implement**

```typescript
// packages/client/shared/gqlIds/TaskSecondaryStatusId.ts
const TaskSecondaryStatusId = {
  join: (taskSecondaryStatusId: number) => `taskSecondaryStatus:${taskSecondaryStatusId}`,
  split: (id: string) => {
    const [, taskSecondaryStatusId] = id.split(':')
    return Number(taskSecondaryStatusId)
  }
}

export default TaskSecondaryStatusId
```

```graphql
# packages/server/graphql/public/typeDefs/TaskSecondaryStatus.graphql
"""
A team-defined secondary status nested under one of the 4 locked primary task statuses
"""
type TaskSecondaryStatus {
  id: ID!

  "The team that defined this secondary status"
  teamId: ID!

  "The team that defined this secondary status"
  team: Team! @scope(name: TEAMS_READ)

  "The primary status this secondary status is nested under"
  status: TaskStatusEnum!

  "The display label, unique per (team, primary status), case-insensitive"
  label: String!

  "Sort order within the primary status band"
  sortOrder: Float!
}
```

```typescript
// packages/server/graphql/public/types/TaskSecondaryStatus.ts
import TaskSecondaryStatusId from '../../../../client/shared/gqlIds/TaskSecondaryStatusId'
import type {TaskSecondaryStatusResolvers} from '../resolverTypes'

const TaskSecondaryStatus: TaskSecondaryStatusResolvers = {
  id: ({id}) => TaskSecondaryStatusId.join(id),
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default TaskSecondaryStatus
```

In `packages/server/graphql/public/typeDefs/Team.graphql`, after the `tasks(...)` field (~line 150) add:

```graphql
  """
  The team-defined secondary statuses nested under the 4 primary task statuses
  """
  secondaryStatuses: [TaskSecondaryStatus!]! @scope(name: TASKS_READ)
```

In `packages/server/graphql/public/types/Team.ts`, add alphabetically to the resolver map (same guard style as `agendaItems`):

```typescript
  secondaryStatuses: ({id: teamId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return []
    return dataLoader.get('taskSecondaryStatusesByTeamId').load(teamId)
  },
```

In `packages/server/graphql/public/typeDefs/Task.graphql`, after the `status` field (~line 119) add:

```graphql
  """
  The team-defined secondary status nested under the primary status, if any
  """
  secondaryStatus: TaskSecondaryStatus @scope(name: TASKS_READ)
```

In `packages/server/graphql/public/types/Task.ts`, add to the resolver map (nullable-FK pattern like `user`):

```typescript
  secondaryStatus: ({secondaryStatusId}, _args, {dataLoader}) => {
    if (!secondaryStatusId) return null
    return dataLoader.get('taskSecondaryStatuses').load(secondaryStatusId)
  },
```

In `codegen.json` `mappers` (alphabetical, near `"Task"`):

```json
"TaskSecondaryStatus": "../../postgres/types/index#TaskSecondaryStatus as TaskSecondaryStatusDB",
```

- [ ] **Step 4: Codegen + run test to verify it passes**

```bash
pnpm codegen
pnpm test:server taskSecondaryStatusCrud
```

Expected: PASS. (If "Cannot query field" persists, restart `pnpm dev` so the server picks up the new schema.)

- [ ] **Step 5: Typecheck + lint + commit**

```bash
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check --write packages/client/shared/gqlIds/TaskSecondaryStatusId.ts packages/server/graphql/public/types/TaskSecondaryStatus.ts packages/server/graphql/public/types/Team.ts packages/server/graphql/public/types/Task.ts packages/server/__tests__/taskSecondaryStatusCrud.test.ts
git add -A packages/client/shared/gqlIds packages/server/graphql codegen.json packages/server/__tests__
git commit -m "feat(tasks-db): TaskSecondaryStatus GraphQL type + Team/Task read fields"
```

---

### Task 4: Validation helper (pure core + loader wrapper)

**Files:**
- Create: `packages/server/graphql/public/mutations/helpers/validateTaskSecondaryStatus.ts`
- Test: `packages/server/graphql/public/mutations/helpers/__tests__/validateTaskSecondaryStatus.test.ts`

**Interfaces:**
- Consumes: `taskSecondaryStatuses` loader (Task 2).
- Produces:
  - `getSecondaryStatusValidationError(row: {teamId: string; status: string} | null | undefined, teamId: string, status: string): string | undefined` (pure)
  - `validateTaskSecondaryStatus(secondaryStatusId: number | null | undefined, teamId: string, status: string, dataLoader: DataLoaderWorker): Promise<string | undefined>`
  - Both return an error string on failure, `undefined` when valid. `null`/`undefined` secondaryStatusId is always valid (clearing/absent).

- [ ] **Step 1: Write the failing unit test**

```typescript
// packages/server/graphql/public/mutations/helpers/__tests__/validateTaskSecondaryStatus.test.ts
import {getSecondaryStatusValidationError} from '../validateTaskSecondaryStatus'

const row = {teamId: 'teamA', status: 'active'}

test('null row (id not provided) is valid', () => {
  expect(getSecondaryStatusValidationError(null, 'teamA', 'active')).toBeUndefined()
})

test('matching team and status is valid', () => {
  expect(getSecondaryStatusValidationError(row, 'teamA', 'active')).toBeUndefined()
})

test('missing row errors', () => {
  expect(getSecondaryStatusValidationError(undefined, 'teamA', 'active')).toBe(
    'Secondary status not found'
  )
})

test('wrong team errors', () => {
  expect(getSecondaryStatusValidationError(row, 'teamB', 'active')).toBe(
    'Secondary status belongs to a different team'
  )
})

test('wrong primary status errors', () => {
  expect(getSecondaryStatusValidationError(row, 'teamA', 'done')).toBe(
    'Secondary status is nested under a different primary status'
  )
})
```

Note: `getSecondaryStatusValidationError` distinguishes "id was never provided" from "row failed to load" by call contract: the async wrapper passes `null` through without loading, and passes the loader result (row or `undefined`) when an id WAS provided.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:server validateTaskSecondaryStatus`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```typescript
// packages/server/graphql/public/mutations/helpers/validateTaskSecondaryStatus.ts
import type {DataLoaderWorker} from '../../../graphql'

/**
 * Pure core. `row` semantics:
 * - null  → no secondaryStatusId was provided (valid: absent or explicit clear)
 * - undefined → an id was provided but no row was found (invalid)
 * - object → the loaded row to check against the task's team + primary status
 */
export const getSecondaryStatusValidationError = (
  row: {teamId: string; status: string} | null | undefined,
  teamId: string,
  status: string
) => {
  if (row === null) return undefined
  if (!row) return 'Secondary status not found'
  if (row.teamId !== teamId) return 'Secondary status belongs to a different team'
  if (row.status !== status) return 'Secondary status is nested under a different primary status'
  return undefined
}

export const validateTaskSecondaryStatus = async (
  secondaryStatusId: number | null | undefined,
  teamId: string,
  status: string,
  dataLoader: DataLoaderWorker
) => {
  if (secondaryStatusId == null) return getSecondaryStatusValidationError(null, teamId, status)
  const row = await dataLoader.get('taskSecondaryStatuses').load(secondaryStatusId)
  return getSecondaryStatusValidationError(row ?? undefined, teamId, status)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:server validateTaskSecondaryStatus`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write packages/server/graphql/public/mutations/helpers/validateTaskSecondaryStatus.ts packages/server/graphql/public/mutations/helpers/__tests__/validateTaskSecondaryStatus.test.ts
git add packages/server/graphql/public/mutations/helpers
git commit -m "feat(tasks-db): secondary status validation helper"
```

---

### Task 5: `addTaskSecondaryStatus` mutation

**Files:**
- Create: `packages/server/graphql/public/typeDefs/addTaskSecondaryStatus.graphql`
- Create: `packages/server/graphql/public/mutations/addTaskSecondaryStatus.ts`
- Create: `packages/server/graphql/public/types/AddTaskSecondaryStatusSuccess.ts`
- Modify: `codegen.json`, `permissions.ts`, `typeDefs/TeamSubscriptionPayload.graphql`
- Test: `packages/server/__tests__/taskSecondaryStatusCrud.test.ts` (append)

**Interfaces:**
- Consumes: Task 2 loaders, Task 3 SDL type.
- Produces: `addTaskSecondaryStatus(teamId: ID!, status: TaskStatusEnum!, label: String!, sortOrder: Float!): AddTaskSecondaryStatusSuccess!`; source type `AddTaskSecondaryStatusSuccessSource = {taskSecondaryStatusId: number; teamId: string}`; publishes `'AddTaskSecondaryStatusSuccess'` on TEAM channel. Cap constant `MAX_SECONDARY_STATUSES_PER_TEAM = 25` exported for tests.

- [ ] **Step 1: Append failing integration tests**

```typescript
// append to packages/server/__tests__/taskSecondaryStatusCrud.test.ts
import getKysely from '../postgres/getKysely'

const ADD_MUTATION = `
  mutation AddTaskSecondaryStatus($teamId: ID!, $status: TaskStatusEnum!, $label: String!, $sortOrder: Float!) {
    addTaskSecondaryStatus(teamId: $teamId, status: $status, label: $label, sortOrder: $sortOrder) {
      taskSecondaryStatus {
        id
        label
        status
        sortOrder
      }
    }
  }
`

test('addTaskSecondaryStatus happy path + appears on Team.secondaryStatuses', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId, status: 'active', label: 'In review', sortOrder: 1},
    cookie
  })
  expect(res.errors).toBeUndefined()
  const created = res.data.addTaskSecondaryStatus.taskSecondaryStatus
  expect(created).toMatchObject({label: 'In review', status: 'active', sortOrder: 1})
  expect(created.id).toMatch(/^taskSecondaryStatus:\d+$/)
})

test('addTaskSecondaryStatus blocks a non-team-member', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId: victim.teamId, status: 'active', label: 'Sneaky', sortOrder: 1},
    cookie: attacker.cookie
  })
  expect(res.data).toBeNull()
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not on team')})
  ])
})

test('addTaskSecondaryStatus rejects case-insensitive duplicate label', async () => {
  const {teamId, cookie} = await signUp()
  const vars = {teamId, status: 'stuck', label: 'Blocked', sortOrder: 1}
  await sendPublic({query: ADD_MUTATION, variables: vars, cookie})
  const dupe = await sendPublic({
    query: ADD_MUTATION,
    variables: {...vars, label: 'BLOCKED', sortOrder: 2},
    cookie
  })
  expect(dupe.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('already exists')})
  ])
})

test('addTaskSecondaryStatus enforces the 25-per-team cap', async () => {
  const {teamId, cookie} = await signUp()
  // seed 25 directly; the mutation is the 26th
  const pg = getKysely()
  await pg
    .insertInto('TaskSecondaryStatus')
    .values(
      Array.from({length: 25}, (_, i) => ({
        teamId,
        status: 'active' as const,
        label: `Status ${i}`,
        sortOrder: i
      }))
    )
    .execute()
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId, status: 'future', label: 'One too many', sortOrder: 99},
    cookie
  })
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('limited to 25')})
  ])
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:server taskSecondaryStatusCrud`
Expected: first test (Task 3) still passes; new tests FAIL with `Cannot query field "addTaskSecondaryStatus"`.

- [ ] **Step 3: Implement SDL + resolver + payload + wiring**

```graphql
# packages/server/graphql/public/typeDefs/addTaskSecondaryStatus.graphql
extend type Mutation {
  """
  Add a team-defined secondary status nested under one of the 4 primary task statuses
  """
  addTaskSecondaryStatus(
    "The team defining the secondary status"
    teamId: ID!

    "The primary status to nest under"
    status: TaskStatusEnum!

    "The display label; unique per (team, primary status), case-insensitive"
    label: String!

    "Position within the primary status band"
    sortOrder: Float!
  ): AddTaskSecondaryStatusSuccess! @scope(name: TASKS_WRITE)
}

type AddTaskSecondaryStatusSuccess {
  "The created secondary status"
  taskSecondaryStatus: TaskSecondaryStatus!

  "The team it belongs to"
  team: Team!
}
```

```typescript
// packages/server/graphql/public/mutations/addTaskSecondaryStatus.ts
import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

export const MAX_SECONDARY_STATUSES_PER_TEAM = 25

const addTaskSecondaryStatus: MutationResolvers['addTaskSecondaryStatus'] = async (
  _source,
  {teamId, status, label, sortOrder},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION
  const trimmedLabel = label.trim()
  if (trimmedLabel.length === 0) throw new GraphQLError('Label cannot be empty')
  if (trimmedLabel.length > 100) throw new GraphQLError('Label must be 100 characters or fewer')
  const existing = await dataLoader.get('taskSecondaryStatusesByTeamId').load(teamId)
  if (existing.length >= MAX_SECONDARY_STATUSES_PER_TEAM) {
    throw new GraphQLError(
      `Teams are limited to ${MAX_SECONDARY_STATUSES_PER_TEAM} secondary statuses`
    )
  }
  const dupe = existing.find(
    (row) => row.status === status && row.label.toLowerCase() === trimmedLabel.toLowerCase()
  )
  if (dupe) {
    throw new GraphQLError(`A "${trimmedLabel}" secondary status already exists under ${status}`)
  }

  // RESOLUTION
  const inserted = await pg
    .insertInto('TaskSecondaryStatus')
    .values({teamId, status, label: trimmedLabel, sortOrder})
    .returning('id')
    .executeTakeFirst()
    .catch((e) => {
      // unique-violation backstop for concurrent adds racing the dupe pre-check
      if (e && typeof e === 'object' && 'code' in e && (e as {code?: string}).code === '23505') {
        throw new GraphQLError(
          `A "${trimmedLabel}" secondary status already exists under ${status}`
        )
      }
      throw e
    })
  if (!inserted) throw new GraphQLError('Could not create secondary status')
  dataLoader.clearAll('taskSecondaryStatuses')

  const data = {taskSecondaryStatusId: inserted.id, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'AddTaskSecondaryStatusSuccess', data, subOptions)
  return data
}

export default addTaskSecondaryStatus
```

```typescript
// packages/server/graphql/public/types/AddTaskSecondaryStatusSuccess.ts
import type {AddTaskSecondaryStatusSuccessResolvers} from '../resolverTypes'

export type AddTaskSecondaryStatusSuccessSource = {
  taskSecondaryStatusId: number
  teamId: string
}

const AddTaskSecondaryStatusSuccess: AddTaskSecondaryStatusSuccessResolvers = {
  taskSecondaryStatus: ({taskSecondaryStatusId}, _args, {dataLoader}) => {
    return dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default AddTaskSecondaryStatusSuccess
```

`codegen.json` mappers (alphabetical):

```json
"AddTaskSecondaryStatusSuccess": "./types/AddTaskSecondaryStatusSuccess#AddTaskSecondaryStatusSuccessSource",
```

`packages/server/graphql/public/typeDefs/TeamSubscriptionPayload.graphql` — add inside the type (this is a flat type, NOT a union):

```graphql
  AddTaskSecondaryStatusSuccess: AddTaskSecondaryStatusSuccess
```

`packages/server/graphql/public/permissions.ts` — alphabetical entry in the `Mutation` map (between `addSlackAuth`-area entries and `addTeam`):

```typescript
    addTaskSecondaryStatus: isTeamMember<'Mutation.addTaskSecondaryStatus'>('args.teamId'),
```

- [ ] **Step 4: Codegen + run tests**

```bash
pnpm codegen
pnpm test:server taskSecondaryStatusCrud
```

Expected: PASS (5 tests). Restart `pnpm dev` if the field is unknown.

- [ ] **Step 5: Typecheck + lint + commit**

```bash
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check --write packages/server/graphql/public/mutations/addTaskSecondaryStatus.ts packages/server/graphql/public/types/AddTaskSecondaryStatusSuccess.ts packages/server/graphql/public/permissions.ts codegen.json packages/server/__tests__/taskSecondaryStatusCrud.test.ts
git add -A packages/server/graphql codegen.json packages/server/__tests__
git commit -m "feat(tasks-db): addTaskSecondaryStatus mutation"
```

---

### Task 6: `renameTaskSecondaryStatus` + `moveTaskSecondaryStatus` (+ new shield rule)

**Files:**
- Create: `packages/server/graphql/public/rules/isTeamMemberOfTaskSecondaryStatus.ts`
- Create: `typeDefs/renameTaskSecondaryStatus.graphql`, `typeDefs/moveTaskSecondaryStatus.graphql`
- Create: `mutations/renameTaskSecondaryStatus.ts`, `mutations/moveTaskSecondaryStatus.ts`
- Create: `types/RenameTaskSecondaryStatusSuccess.ts`, `types/MoveTaskSecondaryStatusSuccess.ts`
- Modify: `codegen.json`, `permissions.ts`, `TeamSubscriptionPayload.graphql`
- Test: append to `taskSecondaryStatusCrud.test.ts`

**Interfaces:**
- Consumes: `TaskSecondaryStatusId` (Task 3), loaders (Task 2).
- Produces: `renameTaskSecondaryStatus(id: ID!, label: String!): RenameTaskSecondaryStatusSuccess!`; `moveTaskSecondaryStatus(id: ID!, sortOrder: Float!): MoveTaskSecondaryStatusSuccess!`; shield rule `isTeamMemberOfTaskSecondaryStatus<T>(dotPath)` that splits the composite id, loads the row, and team-gates — reused by Task 7. Both Success sources are `{taskSecondaryStatusId: number; teamId: string}` with the same resolver shape as `AddTaskSecondaryStatusSuccess`.

- [ ] **Step 1: Append failing tests**

```typescript
// append to packages/server/__tests__/taskSecondaryStatusCrud.test.ts

const addStatus = async (
  teamId: string,
  cookie: string,
  label = 'In review',
  status = 'active'
) => {
  const res = await sendPublic({
    query: ADD_MUTATION,
    variables: {teamId, status, label, sortOrder: 1},
    cookie
  })
  return res.data.addTaskSecondaryStatus.taskSecondaryStatus.id as string
}

test('renameTaskSecondaryStatus renames; blocks non-members', async () => {
  const [{teamId, cookie}, attacker] = await Promise.all([signUp(), signUp()])
  const id = await addStatus(teamId, cookie)
  const RENAME = `
    mutation RenameTaskSecondaryStatus($id: ID!, $label: String!) {
      renameTaskSecondaryStatus(id: $id, label: $label) {
        taskSecondaryStatus { id label }
      }
    }
  `
  const attack = await sendPublic({
    query: RENAME,
    variables: {id, label: 'Hijacked'},
    cookie: attacker.cookie
  })
  expect(attack.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not on team')})
  ])

  const renamed = await sendPublic({query: RENAME, variables: {id, label: 'In QA'}, cookie})
  expect(renamed.errors).toBeUndefined()
  expect(renamed.data.renameTaskSecondaryStatus.taskSecondaryStatus).toEqual({id, label: 'In QA'})
})

test('moveTaskSecondaryStatus updates sortOrder', async () => {
  const {teamId, cookie} = await signUp()
  const id = await addStatus(teamId, cookie)
  const moved = await sendPublic({
    query: `
      mutation MoveTaskSecondaryStatus($id: ID!, $sortOrder: Float!) {
        moveTaskSecondaryStatus(id: $id, sortOrder: $sortOrder) {
          taskSecondaryStatus { id sortOrder }
        }
      }
    `,
    variables: {id, sortOrder: 4.5},
    cookie
  })
  expect(moved.errors).toBeUndefined()
  expect(moved.data.moveTaskSecondaryStatus.taskSecondaryStatus).toEqual({id, sortOrder: 4.5})
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:server taskSecondaryStatusCrud`
Expected: prior tests pass; new tests FAIL with `Cannot query field "renameTaskSecondaryStatus"` / `"moveTaskSecondaryStatus"`.

- [ ] **Step 3: Implement the shield rule**

```typescript
// packages/server/graphql/public/rules/isTeamMemberOfTaskSecondaryStatus.ts
import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import TaskSecondaryStatusId from '../../../../client/shared/gqlIds/TaskSecondaryStatusId'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

// isTeamMember can't decode composite ids (taskSecondaryStatus:<int>), so this
// rule splits the id, loads the row, and team-gates — modeled on hasPageAccess
export const isTeamMemberOfTaskSecondaryStatus = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isTeamMemberOfTaskSecondaryStatus-${dotPath}`, {cache: 'strict'})(
    async (source, args, context: GQLContext) => {
      const gqlId = getResolverDotPath(dotPath, source, args)
      const {authToken, dataLoader} = context
      const taskSecondaryStatusId = TaskSecondaryStatusId.split(gqlId)
      if (Number.isNaN(taskSecondaryStatusId)) {
        return new GraphQLError('Invalid TaskSecondaryStatus id')
      }
      const row = await dataLoader.get('taskSecondaryStatuses').load(taskSecondaryStatusId)
      if (!row) return new GraphQLError('Secondary status not found')
      const {teamId} = row
      if (!authToken.tms?.includes(teamId)) {
        return new GraphQLError(`Viewer is not on team`)
      }
      if (context.resourceGrants && !(await context.resourceGrants.hasTeam(teamId))) {
        return new GraphQLError(`PAT does not grant access to this team`)
      }
      return true
    }
  )
```

- [ ] **Step 4: Implement SDL + resolvers + payloads**

```graphql
# packages/server/graphql/public/typeDefs/renameTaskSecondaryStatus.graphql
extend type Mutation {
  """
  Rename a team-defined secondary status. Tasks referencing it keep the FK; only the label changes.
  """
  renameTaskSecondaryStatus(
    "The TaskSecondaryStatus id"
    id: ID!

    "The new display label; unique per (team, primary status), case-insensitive"
    label: String!
  ): RenameTaskSecondaryStatusSuccess! @scope(name: TASKS_WRITE)
}

type RenameTaskSecondaryStatusSuccess {
  "The renamed secondary status"
  taskSecondaryStatus: TaskSecondaryStatus!

  "The team it belongs to"
  team: Team!
}
```

```graphql
# packages/server/graphql/public/typeDefs/moveTaskSecondaryStatus.graphql
extend type Mutation {
  """
  Reorder a team-defined secondary status within its primary status band
  """
  moveTaskSecondaryStatus(
    "The TaskSecondaryStatus id"
    id: ID!

    "The new position within the primary status band"
    sortOrder: Float!
  ): MoveTaskSecondaryStatusSuccess! @scope(name: TASKS_WRITE)
}

type MoveTaskSecondaryStatusSuccess {
  "The moved secondary status"
  taskSecondaryStatus: TaskSecondaryStatus!

  "The team it belongs to"
  team: Team!
}
```

```typescript
// packages/server/graphql/public/mutations/renameTaskSecondaryStatus.ts
import {GraphQLError} from 'graphql'
import TaskSecondaryStatusId from 'parabol-client/shared/gqlIds/TaskSecondaryStatusId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const renameTaskSecondaryStatus: MutationResolvers['renameTaskSecondaryStatus'] = async (
  _source,
  {id, label},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION (shield already verified team membership via the row)
  const taskSecondaryStatusId = TaskSecondaryStatusId.split(id)
  const row = await dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  const {teamId, status} = row
  const trimmedLabel = label.trim()
  if (trimmedLabel.length === 0) throw new GraphQLError('Label cannot be empty')
  if (trimmedLabel.length > 100) throw new GraphQLError('Label must be 100 characters or fewer')
  const siblings = await dataLoader.get('taskSecondaryStatusesByTeamId').load(teamId)
  const dupe = siblings.find(
    (sibling) =>
      sibling.id !== taskSecondaryStatusId &&
      sibling.status === status &&
      sibling.label.toLowerCase() === trimmedLabel.toLowerCase()
  )
  if (dupe) {
    throw new GraphQLError(`A "${trimmedLabel}" secondary status already exists under ${status}`)
  }

  // RESOLUTION
  await pg
    .updateTable('TaskSecondaryStatus')
    .set({label: trimmedLabel})
    .where('id', '=', taskSecondaryStatusId)
    .execute()
    .catch((e) => {
      if (e && typeof e === 'object' && 'code' in e && (e as {code?: string}).code === '23505') {
        throw new GraphQLError(
          `A "${trimmedLabel}" secondary status already exists under ${status}`
        )
      }
      throw e
    })
  dataLoader.clearAll('taskSecondaryStatuses')

  const data = {taskSecondaryStatusId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'RenameTaskSecondaryStatusSuccess', data, subOptions)
  return data
}

export default renameTaskSecondaryStatus
```

```typescript
// packages/server/graphql/public/mutations/moveTaskSecondaryStatus.ts
import TaskSecondaryStatusId from 'parabol-client/shared/gqlIds/TaskSecondaryStatusId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const moveTaskSecondaryStatus: MutationResolvers['moveTaskSecondaryStatus'] = async (
  _source,
  {id, sortOrder},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION (shield already verified team membership via the row)
  const taskSecondaryStatusId = TaskSecondaryStatusId.split(id)
  const row = await dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  const {teamId} = row

  // RESOLUTION
  await pg
    .updateTable('TaskSecondaryStatus')
    .set({sortOrder})
    .where('id', '=', taskSecondaryStatusId)
    .execute()
  dataLoader.clearAll('taskSecondaryStatuses')

  const data = {taskSecondaryStatusId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'MoveTaskSecondaryStatusSuccess', data, subOptions)
  return data
}

export default moveTaskSecondaryStatus
```

```typescript
// packages/server/graphql/public/types/RenameTaskSecondaryStatusSuccess.ts
import type {RenameTaskSecondaryStatusSuccessResolvers} from '../resolverTypes'

export type RenameTaskSecondaryStatusSuccessSource = {
  taskSecondaryStatusId: number
  teamId: string
}

const RenameTaskSecondaryStatusSuccess: RenameTaskSecondaryStatusSuccessResolvers = {
  taskSecondaryStatus: ({taskSecondaryStatusId}, _args, {dataLoader}) => {
    return dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default RenameTaskSecondaryStatusSuccess
```

```typescript
// packages/server/graphql/public/types/MoveTaskSecondaryStatusSuccess.ts
import type {MoveTaskSecondaryStatusSuccessResolvers} from '../resolverTypes'

export type MoveTaskSecondaryStatusSuccessSource = {
  taskSecondaryStatusId: number
  teamId: string
}

const MoveTaskSecondaryStatusSuccess: MoveTaskSecondaryStatusSuccessResolvers = {
  taskSecondaryStatus: ({taskSecondaryStatusId}, _args, {dataLoader}) => {
    return dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default MoveTaskSecondaryStatusSuccess
```

Wiring:
- `codegen.json` mappers: `"MoveTaskSecondaryStatusSuccess": "./types/MoveTaskSecondaryStatusSuccess#MoveTaskSecondaryStatusSuccessSource",` and `"RenameTaskSecondaryStatusSuccess": "./types/RenameTaskSecondaryStatusSuccess#RenameTaskSecondaryStatusSuccessSource",` (alphabetical).
- `TeamSubscriptionPayload.graphql`: add `RenameTaskSecondaryStatusSuccess: RenameTaskSecondaryStatusSuccess` and `MoveTaskSecondaryStatusSuccess: MoveTaskSecondaryStatusSuccess` fields.
- `permissions.ts` (alphabetical; import `{isTeamMemberOfTaskSecondaryStatus}` from `./rules/isTeamMemberOfTaskSecondaryStatus`):

```typescript
    moveTaskSecondaryStatus:
      isTeamMemberOfTaskSecondaryStatus<'Mutation.moveTaskSecondaryStatus'>('args.id'),
    renameTaskSecondaryStatus:
      isTeamMemberOfTaskSecondaryStatus<'Mutation.renameTaskSecondaryStatus'>('args.id'),
```

- [ ] **Step 5: Codegen + run tests + typecheck + lint + commit**

```bash
pnpm codegen
pnpm test:server taskSecondaryStatusCrud
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check --write packages/server/graphql/public/mutations/renameTaskSecondaryStatus.ts packages/server/graphql/public/mutations/moveTaskSecondaryStatus.ts packages/server/graphql/public/types/RenameTaskSecondaryStatusSuccess.ts packages/server/graphql/public/types/MoveTaskSecondaryStatusSuccess.ts packages/server/graphql/public/rules/isTeamMemberOfTaskSecondaryStatus.ts packages/server/graphql/public/permissions.ts codegen.json packages/server/__tests__/taskSecondaryStatusCrud.test.ts
git add -A packages/server/graphql codegen.json packages/server/__tests__
git commit -m "feat(tasks-db): rename/move TaskSecondaryStatus mutations + shield rule"
```

Expected: all `taskSecondaryStatusCrud` tests PASS.

---

### Task 7: `removeTaskSecondaryStatus` (safe-delete)

**Files:**
- Create: `typeDefs/removeTaskSecondaryStatus.graphql`, `mutations/removeTaskSecondaryStatus.ts`, `types/RemoveTaskSecondaryStatusSuccess.ts`
- Modify: `codegen.json`, `permissions.ts`, `TeamSubscriptionPayload.graphql`
- Test: append to `taskSecondaryStatusCrud.test.ts`

**Interfaces:**
- Consumes: Task 6's shield rule; `createTask`'s existing API (for the SET NULL proof, using plain status only — `secondaryStatusId` on createTask arrives in Task 8, so this test sets it via direct kysely UPDATE).
- Produces: `removeTaskSecondaryStatus(id: ID!): RemoveTaskSecondaryStatusSuccess!` where the Success type is `{removedTaskSecondaryStatusId: ID!, team: Team!}`; source `{taskSecondaryStatusId: number; teamId: string}`.

- [ ] **Step 1: Append failing test (safe-delete reverts tasks to bare primary)**

```typescript
// append to packages/server/__tests__/taskSecondaryStatusCrud.test.ts
import TaskSecondaryStatusId from '../../client/shared/gqlIds/TaskSecondaryStatusId'

test('removeTaskSecondaryStatus safe-deletes: tasks revert to bare primary', async () => {
  const {teamId, cookie} = await signUp()
  const gqlId = await addStatus(teamId, cookie, 'Doomed', 'active')
  const dbId = TaskSecondaryStatusId.split(gqlId)

  // create a task, then point it at the secondary via direct UPDATE
  // (createTask gains secondaryStatusId in a later change; this test isolates SET NULL)
  const createRes = await sendPublic({
    query: `
      mutation CreateTask($newTask: CreateTaskInput!) {
        createTask(newTask: $newTask) {
          task { id }
        }
      }
    `,
    variables: {newTask: {teamId, status: 'active', sortOrder: 0}},
    cookie
  })
  const taskId = createRes.data.createTask.task.id
  const pg = getKysely()
  await pg
    .updateTable('Task')
    .set({secondaryStatusId: dbId})
    .where('id', '=', taskId)
    .execute()

  const removeRes = await sendPublic({
    query: `
      mutation RemoveTaskSecondaryStatus($id: ID!) {
        removeTaskSecondaryStatus(id: $id) {
          removedTaskSecondaryStatusId
          team { id }
        }
      }
    `,
    variables: {id: gqlId},
    cookie
  })
  expect(removeRes.errors).toBeUndefined()
  expect(removeRes.data.removeTaskSecondaryStatus.removedTaskSecondaryStatusId).toBe(gqlId)

  // FK ON DELETE SET NULL reverted the task to its bare primary
  const {secondaryStatusId} = await pg
    .selectFrom('Task')
    .select('secondaryStatusId')
    .where('id', '=', taskId)
    .executeTakeFirstOrThrow()
  expect(secondaryStatusId).toBeNull()
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:server taskSecondaryStatusCrud`
Expected: new test FAILS with `Cannot query field "removeTaskSecondaryStatus"`.

- [ ] **Step 3: Implement**

```graphql
# packages/server/graphql/public/typeDefs/removeTaskSecondaryStatus.graphql
extend type Mutation {
  """
  Safe-delete a team-defined secondary status. Tasks referencing it revert to their bare
  primary status (FK ON DELETE SET NULL).
  """
  removeTaskSecondaryStatus(
    "The TaskSecondaryStatus id"
    id: ID!
  ): RemoveTaskSecondaryStatusSuccess! @scope(name: TASKS_WRITE)
}

type RemoveTaskSecondaryStatusSuccess {
  "The id of the removed secondary status"
  removedTaskSecondaryStatusId: ID!

  "The team it belonged to"
  team: Team!
}
```

```typescript
// packages/server/graphql/public/mutations/removeTaskSecondaryStatus.ts
import TaskSecondaryStatusId from 'parabol-client/shared/gqlIds/TaskSecondaryStatusId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removeTaskSecondaryStatus: MutationResolvers['removeTaskSecondaryStatus'] = async (
  _source,
  {id},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION (shield already verified team membership via the row)
  const taskSecondaryStatusId = TaskSecondaryStatusId.split(id)
  const row = await dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  const {teamId} = row

  // RESOLUTION — FK ON DELETE SET NULL reverts referencing tasks to their bare primary
  await pg.deleteFrom('TaskSecondaryStatus').where('id', '=', taskSecondaryStatusId).execute()
  // tasks' secondaryStatusId may have been nulled by the FK — clear both caches
  dataLoader.clearAll(['taskSecondaryStatuses', 'tasks'])

  const data = {taskSecondaryStatusId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveTaskSecondaryStatusSuccess', data, subOptions)
  return data
}

export default removeTaskSecondaryStatus
```

```typescript
// packages/server/graphql/public/types/RemoveTaskSecondaryStatusSuccess.ts
import TaskSecondaryStatusId from '../../../../client/shared/gqlIds/TaskSecondaryStatusId'
import type {RemoveTaskSecondaryStatusSuccessResolvers} from '../resolverTypes'

export type RemoveTaskSecondaryStatusSuccessSource = {
  taskSecondaryStatusId: number
  teamId: string
}

const RemoveTaskSecondaryStatusSuccess: RemoveTaskSecondaryStatusSuccessResolvers = {
  removedTaskSecondaryStatusId: ({taskSecondaryStatusId}) =>
    TaskSecondaryStatusId.join(taskSecondaryStatusId),
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default RemoveTaskSecondaryStatusSuccess
```

Wiring: `codegen.json` mapper `"RemoveTaskSecondaryStatusSuccess": "./types/RemoveTaskSecondaryStatusSuccess#RemoveTaskSecondaryStatusSuccessSource",`; `TeamSubscriptionPayload.graphql` field `RemoveTaskSecondaryStatusSuccess: RemoveTaskSecondaryStatusSuccess`; `permissions.ts` entry:

```typescript
    removeTaskSecondaryStatus:
      isTeamMemberOfTaskSecondaryStatus<'Mutation.removeTaskSecondaryStatus'>('args.id'),
```

- [ ] **Step 4: Codegen + run + typecheck + lint + commit**

```bash
pnpm codegen
pnpm test:server taskSecondaryStatusCrud
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check --write packages/server/graphql/public/mutations/removeTaskSecondaryStatus.ts packages/server/graphql/public/types/RemoveTaskSecondaryStatusSuccess.ts packages/server/graphql/public/permissions.ts codegen.json packages/server/__tests__/taskSecondaryStatusCrud.test.ts
git add -A packages/server/graphql codegen.json packages/server/__tests__
git commit -m "feat(tasks-db): removeTaskSecondaryStatus safe-delete mutation"
```

---

### Task 8: `createTask` accepts `secondaryStatusId`

**Files:**
- Modify: `packages/server/graphql/public/typeDefs/CreateTaskInput.graphql`
- Modify: `packages/server/graphql/public/mutations/createTask.ts`
- Test: `packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts` (new file)

**Interfaces:**
- Consumes: `validateTaskSecondaryStatus` (Task 4), `TaskSecondaryStatusId` (Task 3).
- Produces: `CreateTaskInput.secondaryStatusId: ID` (optional, composite form `taskSecondaryStatus:<int>`); created Task rows carry `secondaryStatusId: number | null`; `Task.secondaryStatus` resolves on the response.

- [ ] **Step 1: Write failing tests**

```typescript
// packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts
import {sendPublic, signUp} from './common'

const ADD_STATUS = `
  mutation AddTaskSecondaryStatus($teamId: ID!, $status: TaskStatusEnum!, $label: String!, $sortOrder: Float!) {
    addTaskSecondaryStatus(teamId: $teamId, status: $status, label: $label, sortOrder: $sortOrder) {
      taskSecondaryStatus { id }
    }
  }
`

const CREATE_TASK = `
  mutation CreateTask($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      error { message }
      task {
        id
        status
        secondaryStatus { id label }
        user { id }
      }
    }
  }
`

const addStatus = async (teamId: string, cookie: string, label: string, status: string) => {
  const res = await sendPublic({
    query: ADD_STATUS,
    variables: {teamId, status, label, sortOrder: 1},
    cookie
  })
  return res.data.addTaskSecondaryStatus.taskSecondaryStatus.id as string
}

test('createTask with a valid secondaryStatusId', async () => {
  const {teamId, cookie} = await signUp()
  const secondaryId = await addStatus(teamId, cookie, 'In review', 'active')
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {
      newTask: {teamId, status: 'active', sortOrder: 0, secondaryStatusId: secondaryId}
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.createTask.task.secondaryStatus).toEqual({id: secondaryId, label: 'In review'})
})

test('createTask rejects a secondary nested under a different primary', async () => {
  const {teamId, cookie} = await signUp()
  const secondaryId = await addStatus(teamId, cookie, 'Blocked', 'stuck')
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {
      newTask: {teamId, status: 'active', sortOrder: 0, secondaryStatusId: secondaryId}
    },
    cookie
  })
  expect(res.data.createTask.error.message).toMatch('different primary status')
})

test("createTask rejects another team's secondary", async () => {
  const [alice, bob] = await Promise.all([signUp(), signUp()])
  const bobSecondary = await addStatus(bob.teamId, bob.cookie, 'In review', 'active')
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {
      newTask: {
        teamId: alice.teamId,
        status: 'active',
        sortOrder: 0,
        secondaryStatusId: bobSecondary
      }
    },
    cookie: alice.cookie
  })
  expect(res.data.createTask.error.message).toMatch('different team')
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:server taskSecondaryStatusOnTasks`
Expected: FAIL — `Field "secondaryStatusId" is not defined by type "CreateTaskInput"`.

- [ ] **Step 3: Implement**

In `CreateTaskInput.graphql`, after the `status` field add:

```graphql
  """
  Optional team-defined secondary status nested under status. Must belong to teamId and to the
  same primary status. Format: taskSecondaryStatus:<id>
  """
  secondaryStatusId: ID
```

In `createTask.ts`:

1. Add imports:

```typescript
import TaskSecondaryStatusId from 'parabol-client/shared/gqlIds/TaskSecondaryStatusId'
import {validateTaskSecondaryStatus} from './helpers/validateTaskSecondaryStatus'
```

2. Destructure `secondaryStatusId` from `newTask` alongside the others (line ~146) and decode it before the validator `Promise.all`:

```typescript
  const {
    meetingId,
    discussionId,
    threadParentId,
    threadSortOrder,
    sortOrder,
    status,
    teamId,
    userId,
    secondaryStatusId
  } = newTask
  const dbSecondaryStatusId = secondaryStatusId ? TaskSecondaryStatusId.split(secondaryStatusId) : null
```

3. Add the validator to the existing `Promise.all` (after `validateTaskUserIsTeamMember`):

```typescript
    validateTaskUserIsTeamMember(userId, teamId, dataLoader),
    validateTaskSecondaryStatus(dbSecondaryStatusId, teamId, status, dataLoader)
```

4. Add to the task insert object (after `status,`):

```typescript
    secondaryStatusId: dbSecondaryStatusId,
```

- [ ] **Step 4: Run tests**

```bash
pnpm codegen
pnpm test:server taskSecondaryStatusOnTasks
```

Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck + lint + commit**

```bash
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check --write packages/server/graphql/public/mutations/createTask.ts packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts
git add -A packages/server/graphql packages/server/__tests__
git commit -m "feat(tasks-db): createTask accepts secondaryStatusId"
```

---

### Task 9: `updateTask` — secondaryStatusId, auto-clear invariant, null-userId unassign fix

**Files:**
- Modify: `packages/server/graphql/public/typeDefs/UpdateTaskInput.graphql`
- Modify: `packages/server/graphql/public/mutations/updateTask.ts`
- Test: append to `taskSecondaryStatusOnTasks.test.ts`

**Interfaces:**
- Consumes: Task 4 validator, Task 3 gqlIds.
- Produces: `UpdateTaskInput.secondaryStatusId: ID` (undefined = untouched, null = clear, value = set-with-validation); server auto-clears `secondaryStatusId` when the primary `status` changes without a new secondary (spec §3.2); `updateTask` can now unassign via `userId: null` (spec bug fix).

- [ ] **Step 1: Append failing tests**

```typescript
// append to packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts

const UPDATE_TASK = `
  mutation UpdateTask($updatedTask: UpdateTaskInput!) {
    updateTask(updatedTask: $updatedTask) {
      error { message }
      task {
        id
        status
        secondaryStatus { id }
        user { id }
      }
    }
  }
`

const createTaskWithSecondary = async () => {
  const {userId, teamId, orgId, cookie} = await signUp()
  const secondaryId = await addStatus(teamId, cookie, 'In review', 'active')
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {
      newTask: {teamId, status: 'active', sortOrder: 0, secondaryStatusId: secondaryId, userId}
    },
    cookie
  })
  const taskId = res.data.createTask.task.id as string
  return {userId, teamId, orgId, cookie, secondaryId, taskId}
}

test('updateTask sets and clears secondaryStatusId', async () => {
  const {cookie, taskId, secondaryId} = await createTaskWithSecondary()
  // explicit null clears
  const cleared = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, secondaryStatusId: null}},
    cookie
  })
  expect(cleared.data.updateTask.task.secondaryStatus).toBeNull()
  // set it back
  const setAgain = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, secondaryStatusId: secondaryId}},
    cookie
  })
  expect(setAgain.data.updateTask.task.secondaryStatus).toEqual({id: secondaryId})
})

test('updateTask auto-clears secondary when primary status changes', async () => {
  const {cookie, taskId} = await createTaskWithSecondary()
  const res = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, status: 'done'}},
    cookie
  })
  expect(res.data.updateTask.task).toMatchObject({status: 'done', secondaryStatus: null})
})

test('updateTask rejects a secondary that mismatches the new primary', async () => {
  const {cookie, taskId, secondaryId} = await createTaskWithSecondary()
  // secondary is nested under active; moving to done while keeping it must fail
  const res = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, status: 'done', secondaryStatusId: secondaryId}},
    cookie
  })
  expect(res.data.updateTask.error.message).toMatch('different primary status')
})

test('updateTask userId: null unassigns (bug fix)', async () => {
  const {cookie, taskId, userId} = await createTaskWithSecondary()
  // sanity: currently assigned
  const before = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, sortOrder: 1}},
    cookie
  })
  expect(before.data.updateTask.task.user).toEqual({id: userId})
  const res = await sendPublic({
    query: UPDATE_TASK,
    variables: {updatedTask: {id: taskId, userId: null}},
    cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.updateTask.task.user).toBeNull()
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:server taskSecondaryStatusOnTasks`
Expected: Task 8 tests pass; new tests FAIL (`Field "secondaryStatusId" is not defined by type "UpdateTaskInput"`; the unassign test fails on `user` still set).

- [ ] **Step 3: Implement**

In `UpdateTaskInput.graphql`, after `status` add:

```graphql
  """
  Team-defined secondary status nested under the primary status. Omit to leave untouched;
  null clears it. Cleared automatically server-side when status changes without a new value.
  Format: taskSecondaryStatus:<id>
  """
  secondaryStatusId: ID
```

In `updateTask.ts`:

1. Add imports:

```typescript
import TaskSecondaryStatusId from 'parabol-client/shared/gqlIds/TaskSecondaryStatusId'
import {validateTaskSecondaryStatus} from './helpers/validateTaskSecondaryStatus'
```

2. Extend the destructure (line ~29) and add validation after the existing `validateTaskUserIsTeamMember` block:

```typescript
  const {id: taskId, userId: inputUserId, status, sortOrder, content, secondaryStatusId} = updatedTask
```

```typescript
  const nextStatus = status || task.status
  // undefined = untouched; null = clear; string = set (validated)
  const dbSecondaryStatusId =
    secondaryStatusId == null ? secondaryStatusId : TaskSecondaryStatusId.split(secondaryStatusId)
  if (typeof dbSecondaryStatusId === 'number') {
    const secondaryError = await validateTaskSecondaryStatus(
      dbSecondaryStatusId,
      teamId,
      nextStatus,
      dataLoader
    )
    if (secondaryError) return {error: {message: secondaryError}}
  }
  const isPrimaryChanging = !!status && status !== task.status
  // auto-clear invariant (spec §3.2): a primary change without a new secondary clears the old one
  const nextSecondaryStatusId =
    dbSecondaryStatusId !== undefined ? dbSecondaryStatusId : isPrimaryChanging ? null : undefined
```

3. Fix the `.set()` object (lines ~50-57) — `userId` line is THE unassign bug fix (`null` must pass through to kysely; only `undefined` skips):

```typescript
    .set({
      content: content ? validContent : undefined,
      plaintextContent,
      sortOrder: sortOrder || undefined,
      status: status || undefined,
      userId: inputUserId,
      secondaryStatusId: nextSecondaryStatusId,
      tags: content ? getTagsFromTipTapTask(validContent) : undefined
    })
```

- [ ] **Step 4: Codegen + run tests**

```bash
pnpm codegen
pnpm test:server taskSecondaryStatusOnTasks
```

Expected: PASS (7 tests).

- [ ] **Step 5: Typecheck + lint + commit**

```bash
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check --write packages/server/graphql/public/mutations/updateTask.ts packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts
git add -A packages/server/graphql packages/server/__tests__
git commit -m "feat(tasks-db): updateTask secondaryStatusId + auto-clear + null-userId unassign fix"
```

---

### Task 10: `changeTaskTeam` clears the secondary on cross-team moves

**Files:**
- Modify: `packages/server/graphql/public/mutations/changeTaskTeam.ts` (the `.set()` at lines ~123-130)
- Test: append to `taskSecondaryStatusOnTasks.test.ts`

**Interfaces:**
- Consumes: existing `changeTaskTeam(taskId, teamId)`; `addTeam` mutation (for a second team in the test).
- Produces: tasks moved across teams always land with `secondaryStatusId: null` (vocabulary never follows; spec §3.2).

- [ ] **Step 1: Append failing test**

```typescript
// append to packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts

test('changeTaskTeam clears secondaryStatusId', async () => {
  const {cookie, taskId, orgId} = await createTaskWithSecondary()
  // create a second team owned by the same user
  // NewTeamInput requires {name: String!, orgId: ID!, isPublic: Boolean!} (verified SDL);
  // AddTeamPayload is a plain type — direct selection, no fragment needed
  const addTeamRes = await sendPublic({
    query: `
      mutation AddTeam($newTeam: NewTeamInput!) {
        addTeam(newTeam: $newTeam) {
          team { id }
        }
      }
    `,
    variables: {newTeam: {name: `Second Team ${Date.now()}`, orgId, isPublic: false}},
    cookie
  })
  const newTeamId = addTeamRes.data.addTeam.team.id
  const moveRes = await sendPublic({
    query: `
      mutation ChangeTaskTeam($taskId: ID!, $teamId: ID!) {
        changeTaskTeam(taskId: $taskId, teamId: $teamId) {
          task {
            id
            teamId
            secondaryStatus { id }
          }
        }
      }
    `,
    variables: {taskId, teamId: newTeamId},
    cookie
  })
  expect(moveRes.errors).toBeUndefined()
  expect(moveRes.data.changeTaskTeam.task).toMatchObject({
    teamId: newTeamId,
    secondaryStatus: null
  })
})
```


- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:server taskSecondaryStatusOnTasks`
Expected: new test FAILS — `secondaryStatus` still set after the move.

- [ ] **Step 3: Implement**

In `changeTaskTeam.ts`, extend the Task update `.set()` (lines ~123-130):

```typescript
  await pg
    .updateTable('Task')
    .set({
      teamId,
      // secondary statuses are team-scoped vocabulary; they never follow a cross-team move
      secondaryStatusId: null,
      integration: JSON.stringify(integration)
    })
    .where('id', '=', taskId)
    .executeTakeFirst()
```

- [ ] **Step 4: Run tests**

Run: `pnpm test:server taskSecondaryStatusOnTasks`
Expected: PASS (8 tests).

- [ ] **Step 5: Typecheck + lint + commit**

```bash
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check --write packages/server/graphql/public/mutations/changeTaskTeam.ts packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts
git add -A packages/server/graphql packages/server/__tests__
git commit -m "feat(tasks-db): changeTaskTeam clears secondaryStatusId"
```

---

### Task 11: Full verification + PR

**Files:** none new — verification + PR only.

- [ ] **Step 1: Full test + typecheck + lint sweep**

```bash
pnpm test:server taskSecondaryStatus        # runs all 3 new suites (Crud, OnTasks, dataloader) + helper test
npx tsgo -p packages/server/tsconfig.json --noEmit
pnpm exec biome check packages/server/graphql/public packages/server/dataloader packages/server/postgres packages/client/shared/gqlIds/TaskSecondaryStatusId.ts
pnpm relay:build                            # full schema + artifacts regen must succeed cleanly
git status --short                          # only intended files; commit any regenerated artifacts
```

Expected: all suites PASS; typecheck and biome clean; `relay:build` exits 0. If `relay:build` regenerated `schema.graphql`/artifacts, commit them: `git add -A && git commit -m "chore(tasks-db): regenerate graphql artifacts"`.

- [ ] **Step 2: Open the PR**

```bash
git push -u origin s1-server-foundations
gh pr create --base feat/tasks-as-database --title "Sprint 1: server foundations for tasks-as-database (secondaryStatus)" --body "$(cat <<'EOF'
## Sprint 1 — Server foundations (spec §7, screens 07 & 10 API surface)

Implements spec `docs/superpowers/specs/2026-07-14-tasks-as-database-design.md` §3.1–§3.5 server-side, zero UI change:

- **`TaskSecondaryStatus`** table (per-team vocabulary; unique per `(teamId, status, lower(label))`; float sortOrder per decision 7)
- **`Task.secondaryStatusId`** int FK **ON DELETE SET NULL** — safe-delete = schema behavior (screen 07)
- CRUD mutations `add/rename/move/removeTaskSecondaryStatus` publishing on the **TEAM** channel
- `createTask`/`updateTask` accept `secondaryStatusId` with team+primary validation and the **auto-clear invariant** (primary change without new secondary clears it)
- `changeTaskTeam` clears the secondary (vocabulary never crosses teams)
- **Bug fix:** `updateTask` `userId: null` now unassigns (was silently ignored via `|| undefined`)
- ⚠️ **New shield rule** `isTeamMemberOfTaskSecondaryStatus` (isTeamMember can't decode composite ids) — flagging per the ask-before-new-rules convention
- Deleted stray `publishedDataloader*.json` debug dumps from repo root

## Tests
- `packages/server/__tests__/taskSecondaryStatusCrud.test.ts` — CRUD happy paths, attacker/victim shield denials, case-insensitive dup, 25-cap, SET NULL safe-delete proof
- `packages/server/__tests__/taskSecondaryStatusOnTasks.test.ts` — createTask/updateTask validation trio, auto-clear, unassign fix, changeTaskTeam clear
- `packages/server/dataloader/__tests__/taskSecondaryStatuses.test.ts` — loaders + unique index
- `packages/server/graphql/public/mutations/helpers/__tests__/validateTaskSecondaryStatus.test.ts` — pure validator

Verification bar per spec §8: typecheck + biome + unit/integration tests (evidence in checks + comments).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Paste test-run evidence as a PR comment** (`pnpm test:server taskSecondaryStatus` output).

---

## Plan Self-Review Notes (already applied)

- Spec coverage: §3.1 (Task 1), §3.2 invariants (Tasks 1, 8, 9, 10), §3.5 mutations/reads (Tasks 3, 5–7), unassign fix (Task 9), publish-after-write + TEAM channel (Tasks 5–7), shield + @scope (Tasks 5–7), dataloaders (Task 2), cleanup (Task 1). Sprint-1 row of §7 fully mapped.
- The `sortOrder: sortOrder || undefined` falsy-zero quirk in updateTask (drops explicit 0) is pre-existing and left untouched — out of Sprint 1 scope; noted for Sprint 2's kanban work.
- Type consistency: `TaskSecondaryStatusId.split` returns `number`; all Success sources use `{taskSecondaryStatusId: number; teamId: string}`; `validateTaskSecondaryStatus` takes the decoded number.
