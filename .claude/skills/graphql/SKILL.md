---
name: graphql
description: Conventions for the SDL-first GraphQL server — payload types, codegen mappers, dataLoaders, TypeScript safety, database patterns, and migration best practices. Use when writing or reviewing GraphQL mutations, queries, or resolvers.
---

# Server GraphQL Migration Notes

### `schema.graphql` is auto-generated — never edit it directly
The file `packages/server/graphql/public/schema.graphql` is generated from `typeDefs/*.graphql`. Always add new types and mutations to files in `typeDefs/` — one `.graphql` file per type or input, plus entries in `Mutation.graphql` or `Query.graphql`. Run `pnpm codegen` to regenerate.

### Type source files (`public/types/`)
Only needed when the payload type requires **custom field resolvers** beyond the default passthrough. Examples:
- Store an ID and load the full object via dataLoader (e.g. `CreateTaskPayload` stores `taskId`, resolves `task` via dataLoader)
- Deleted entities that can't be re-fetched: store the full object in the source directly (e.g. `DeleteTaskPayload` returns `{task}` — the TaskDB — directly; no custom resolver needed because `Task` is already mapped to `TaskDB` in codegen)

### codegen.json mappers
Only add a mapper entry when you create a new source type file. If the payload's fields are all handled by existing mapped types (e.g. `Task → TaskDB`) and the default resolver suffices, no mapper is needed.

**Mapper path for DB-backed types:** When a GraphQL type maps directly to a Postgres table row, derive the type from the select helper and reference it from `postgres/types/index.d.ts`:
1. Add a `selectFoo()` helper in `packages/server/postgres/select.ts` (explicitly list columns — **omit sensitive fields** like `hashedToken`, `password`, etc.)
2. Export `export type Foo = ExtractTypeFromQueryBuilderSelect<typeof selectFoo>` from `packages/server/postgres/types/index.d.ts`
3. Set the mapper in `codegen.json` to `"../../postgres/types/index#Foo"` (not a hand-rolled source type file)

**Always run `pnpm codegen` after modifying `codegen.json`** to regenerate `resolverTypes.ts` and confirm no type errors were introduced. Do not assume the mapper is correct until codegen succeeds.

### Import paths from `public/mutations/`
- postgres utilities: `../../../postgres/...`
- server utils: `../../../utils/...`
- resolverTypes: `../resolverTypes`
- old shared helpers (not yet migrated): `../../mutations/helpers/<helper>`

### Rate limiting / higher-order resolver wrappers
Old mutations sometimes wrap their resolve function with a `rateLimit({perMinute, perHour})` higher-order function from `packages/server/graphql/rateLimit.ts`. In the SDL-first architecture, this pattern is replaced by a graphql-shield rule in `packages/server/graphql/public/permissions.ts`.

### Adding source types to existing GraphQL type resolvers (e.g. RetroDiscussStage)
Some SDL types already have a resolver file in `public/types/` but no exported source type. When a payload field needs to return one of these types (e.g. `stage: RetroDiscussStage`), you must:

1. **Define a source interface** in the existing type file using types from `packages/server/postgres/types/NewMeetingPhase.d.ts` (NOT the deprecated `/database` directory). For stage types, `augmentDBStage` (in `packages/server/graphql/resolvers.ts`) spreads `{...stage, meetingId, phaseType, teamId}`, so the source extends the Postgres stage interface with `meetingId` and `teamId` (`phaseType` is already a literal on the interface):
   ```ts
   // public/types/RetroDiscussStage.ts
   import type {DiscussStage} from '../../../postgres/types/NewMeetingPhase'

   export interface DiscussStageSource extends DiscussStage {
     meetingId: string
     teamId: string
   }
   ```

2. **Add a mapper** in `codegen.json`:
   ```json
   "RetroDiscussStage": "./types/RetroDiscussStage#DiscussStageSource"
   ```

The same pattern applies to other concrete stage types (e.g. `EstimateStage` → extends `EstimateStage` from `NewMeetingPhase.d.ts`). Check the existing `public/types/` file first — a resolver file may already exist without a source type export.

### TypeScript checking: use `tsgo` not `tsc`
Use `npx tsgo -p packages/server/tsconfig.json --noEmit` (NOT `pnpm tsc` or `tsc`).

### Deprecated `/database` directory — always use `postgres/types/`
All classes/types in `packages/server/database/types/` are **deprecated**. When writing source type interfaces for `public/types/` resolvers, always import from `packages/server/postgres/types/NewMeetingPhase.d.ts` (or other files in `postgres/types/`) instead. If an existing file imports from the `database/` directory, flag it and replace the import.

If a codegen mapper references a type from the `database/` directory, replace it with the equivalent interface from `postgres/types/NewMeetingPhase.d.ts`.

### Field resolvers with IDs vs full objects
When a mutation returns IDs (not full objects), the payload type source needs custom field resolvers:
- Store the ID in the source (e.g. `{orgId, teamIds}`)
- In the type source file, use dataLoader to resolve the full object
- Add a mapper entry in `codegen.json`
- Use `loadNonNull` when the SDL field is non-nullable (e.g. `meeting: NewMeeting`), `load` when nullable

The error branch pattern for union-style payloads with inline error:
```ts
export type FooPayloadSource = {orgId: string; teamIds: string[]} | {error: {message: string}}

const FooPayload: FooPayloadResolvers = {
  organization: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('organizations').loadNonNull(source.orgId)
  },
  // loadMany returns (T | Error)[] — always filter with isValid and make the resolver async
  teams: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('teams').loadMany(source.teamIds)).filter(isValid)
  }
}
```

### Date arithmetic: use the `ms` package
When computing future/past dates, use `ms` from the `ms` package instead of manual millisecond math:
```ts
import ms from 'ms'
const maxAllowed = new Date(Date.now() + ms('60d'))
```

### Mutation return types: always use `*Success` directly — union Payloads are deprecated
Mutations must return the `*Success` type directly (e.g. `SetCompanyTeamLimitAtSuccess!`). The `union *Payload = ErrorPayload | *Success` pattern is **deprecated** — do not use it for new mutations. On errors, throw a `GraphQLError` instead of returning an error object.

---

### @scope directive for PAT authorization on mutations and read fields

- **Use @scope directive on all GraphQL mutations and read fields for PAT authorization.** Every mutation field in the GraphQL schema MUST have a @scope(name: OAuthScopeEnum!) directive. The applyScopeDirective transformer enforces this at startup — if any Mutation field is missing the directive, the server throws an error. Read fields on types like User, Team, and Organization also use @scope for PAT-authorized read access. The scope names follow the pattern ENTITY\_READ or ENTITY\_WRITE (e.g., TEAMS\_WRITE, TASKS\_READ, ORGS\_WRITE, COMMENTS\_WRITE). For regular JWT-authenticated requests the directive is a no-op; for PAT bearer tokens it verifies the token has the required scope.
  ```
  // Good
    addAgendaItem(newAgendaItem: CreateAgendaItemInput!): AddAgendaItemPayload @scope(name: TEAMS_WRITE)
    archivedTasks(first: Int!, after: DateTime, teamId: ID!): TaskConnection @scope(name: TASKS_READ)

  // Bad
    addAgendaItem(newAgendaItem: CreateAgendaItemInput!): AddAgendaItemPayload
    # Missing @scope directive — server will throw at startup
  ```

## TypeScript & Type Safety

- **Never use `any`** without strong justification. Don't remove type annotations.
- **Use generated types** from the GraphQL schema and database — don't manually define types that come from codegen or `postgres/types/`.
- **Handle null/undefined** for all nullable types. Use optional chaining (`?.`) and nullish coalescing (`??`).
- **Avoid database ORM classes.** Use plain objects (POJOs) for database inserts/updates — classes don't account for differences between inserts, updates, and reads. POJOs give better type checking with Kysely.
- **Create objects in a single call** instead of building them incrementally across multiple statements. Cleaner for the compiler and immediately shows if variables are unused.
- **Kysely: `undefined` skips the field, `null` sets it to NULL.** The DB driver ignores `undefined` values but does _not_ ignore `null`. Use this distinction intentionally.
- **Use `Number(id)`** when passing string IDs to PostgreSQL integer columns. PG may accept strings, but not every dataloader will.

- **Type mutation resolvers as MutationResolvers\['mutationName'] and type resolvers as ReqResolvers<'TypeName'>.** Mutation resolver functions must be typed using the generated MutationResolvers index type: \`const myMutation: MutationResolvers\['myMutation'] = async (\_, args, context) => { ... }\`. Type resolvers (for object types like User, Team, PersonalAccessToken) use a custom \`ReqResolvers<'TypeName'>\` wrapper that ensures all fields not present on the mapper parent type are required to be implemented. Both patterns use codegen'd types from resolverTypes.
  ```
  // Good
    const createPersonalAccessToken: MutationResolvers['createPersonalAccessToken'] = async (_, args, {authToken}) => { ... }
    
    const PersonalAccessToken: ReqResolvers<'PersonalAccessToken'> = {
      id: ({prefix}) => `pat_${prefix}`
    }

  // Bad
    const createPersonalAccessToken = async (_, args, context) => { ... }  // Untyped resolver
    const PersonalAccessToken = { id: ({prefix}) => `pat_${prefix}` }  // Missing ReqResolvers type
  ```

## DataLoader Best Practices

- **Always use DataLoaders** for related data fetching in resolvers — never query the DB directly from a resolver.
  - Helper functions: `packages/server/postgres/select.ts` — **use these select helpers, not `selectAll()`**, so sensitive columns are excluded automatically
  - Type definitions: `packages/server/dataloader/RootDataLoader.ts`
  - Loader implementation: `packages/server/dataloader/*Loader.ts`
- **Call `dispose()` on dataloaders** as soon as they're no longer needed. Don't extend dataloader lifetime unnecessarily.
- **Include `mutatorId` in publish calls.** Without it, the user who triggered the mutation gets the message twice (once from the mutation response and once from the subscription).

## Database Conventions

- **Use `varchar(N)` instead of `text`** — text columns shouldn't accept arbitrarily large data.
  - `varchar(43)`: cryptographically secure 256-bit base64url tokens
  - `varchar(255)`: general short strings (names, emails)
  - `varchar(2000)`: longer content with reasonable limits
- **Always use foreign key constraints.** Use `ON DELETE CASCADE` when children should be deleted with parents, `ON DELETE SET NULL` when orphaned records should remain.
- **Use integer primary keys** (`int` or `bigint`). Only use UUIDs when distributed ID generation is required.
- **Consistent naming**: `orgId` not `organizationId` — follow existing column naming conventions.
- **Let the database manage timestamps** — don't set `updatedAt` or `createdAt` in application code; let triggers/defaults handle them.
- **Migrations must be idempotent.** Use `IF NOT EXISTS` / `IF EXISTS` so they don't fail on re-run or during upgrades.
- **Migrations use `Kysely<any>`** — the `any` is intentional since migrations are frozen in time and must not reference evolving DB types. Export `async function up(db: Kysely<any>)` and `async function down(db: Kysely<any>)`. Name files with ISO timestamps: `2026-03-30T12:08:00.000Z_description.ts`.
- **Use queries for read operations, mutations for writes.** Don't use mutations for operations that only read data.
- **Store data in the database** rather than computing values on-the-fly in code.

- **Centralize table queries in select.ts factory functions returning composable Kysely query builders.** All database table queries go through factory functions in packages/server/postgres/select.ts named select\<TableName>(). These return Kysely query builders (not executed queries) so callers can chain additional .where(), .select(), .orderBy() etc. They handle type narrowing ($narrowType), JSON column casting (fn\<T>('to\_json', \[col])), and custom type assertions (AssertedQuery). This pattern avoids raw SQL, centralizes column selection, and enables type-safe composability.
  ```
  // Good
    export const selectPersonalAccessToken = () => {
      return getKysely()
        .selectFrom('PersonalAccessToken')
        .select(['id', 'createdAt', 'expiresAt', 'name', 'prefix', 'revokedAt', 'userId'])
        .select(({fn}) => [fn<string[]>('to_json', ['scopes']).as('scopes')])
    }
    // Usage:
    const tokens = await selectPersonalAccessToken().where('userId', '=', viewerId).execute()

  // Bad
    // Don't write raw queries or inline selectFrom in resolvers
    const tokens = await getKysely().selectFrom('PersonalAccessToken').selectAll().where('userId', '=', viewerId).execute()
  ```

## YJS / CRDT Patterns

- **Wrap all YJS writes in `yDoc.transact()`** — an abrupt exit could corrupt data otherwise.
- **Use primitives for simple YJS values.** `Y.Text` is a `Y.Array` of characters; for atomic replacements, plain strings/numbers stored in `Y.Map` are simpler and faster.
- **Design data structures for concurrent editing.** Prefer Maps of row IDs over arrays to avoid position conflicts during concurrent editing.

## Architecture

- **Avoid distributed state in single-replica services.** Don't keep counts or state in-memory — store in Redis or PostgreSQL so you can run multiple replicas.
- **Check permissions with a whitelist approach** (check if user HAS access, default to false). Don't check if they DON'T have access (blacklist approach).
- **Explain non-obvious architectural decisions in comments** — prevents cargo-culting of bad patterns.
- **Avoid O(n) operations in hot paths.** Use UUIDs (`crypto.randomUUID()`) or Snowflake IDs for guaranteed uniqueness instead of collision checks.

## Security

- **Sanitize HTML with DOMPurify** — never render user-provided HTML without sanitization.
- **CSRF protection for OAuth**: generate and validate `state` parameters using `crypto.randomBytes(32).toString('base64url')`.
- **Normalize SAML attribute names** — attribute names vary by provider. Document expected names and normalize to consistent internal naming.
- **Properly escape CSV data** — use `json2csv` with string formatters. Commas, quotes, and newlines in cell values break naive CSV generation.

## Performance

- **Use Recursive Character Level Chunking** for LLM text chunking — retains sentence boundaries, merges when appropriate, results in fewer chunks.
- **Generate large documents server-side** (PDFs, HTML emails). Use lightweight libraries like `pdfjs` rather than heavy client-side solutions.
