# Server GraphQL Migration Notes

## SDL-First Migration Pattern

Old mutations live in `packages/server/graphql/mutations/`. New mutations go in `packages/server/graphql/public/mutations/`.

### Migration steps for each mutation

Use `git mv` to move files so git records them as renames (not delete+add). The workflow:

1. **Write new content to a temp location**, or save it in memory
2. **`git mv`** old file to new location:
   - Mutation: `git mv mutations/<name>.ts public/mutations/<name>.ts`
   - Type: `git mv types/<OldPayload>.ts public/types/<NewType>.ts` (name may change, e.g. `Payload→Success`)
3. **Overwrite** the moved file with the new SDL-first implementation
4. **Remove** from `packages/server/graphql/rootMutation.ts` (imports + fields object)

If you've already created the new file and deleted the old one (both untracked/unstaged), fix it with:
```bash
cp new_file tmp && rm new_file && git restore old_file && git mv old_file new_file && cp tmp new_file && rm tmp
```

New mutations are auto-discovered via `require.context('./mutations', ...)` in `resolvers.ts` — no explicit registration needed.

### Follow named exports when migrating
If the old mutation file had **named exports** (e.g. `export const createMeetingMember = ...`) in addition to the default export, other files may import those helpers. After deleting the old file, grep for the export name across the codebase and update all import paths to point to the new location. Example:
```bash
grep -r "createMeetingMember" packages/server --include="*.ts" -l
```
Then update each consumer's import path from the old file to the new one.

### SDL/typeDefs
- Mutation entry in `public/typeDefs/Mutation.graphql` must exist before migrating
- Payload type `.graphql` files must exist in `public/typeDefs/`
- Both are often already present before code migration begins

### Type source files (`public/types/`)
Only needed when the payload type requires **custom field resolvers** beyond the default passthrough. Examples:
- Store an ID and load the full object via dataLoader (e.g. `CreateTaskPayload` stores `taskId`, resolves `task` via dataLoader)
- Deleted entities that can't be re-fetched: store the full object in the source directly (e.g. `DeleteTaskPayload` returns `{task}` — the TaskDB — directly; no custom resolver needed because `Task` is already mapped to `TaskDB` in codegen)

### codegen.json mappers
Only add a mapper entry when you create a new source type file. If the payload's fields are all handled by existing mapped types (e.g. `Task → TaskDB`) and the default resolver suffices, no mapper is needed.

**Always run `pnpm codegen` after modifying `codegen.json`** to regenerate `resolverTypes.ts` and confirm no type errors were introduced. Do not assume the mapper is correct until codegen succeeds.

### Import paths from `public/mutations/`
- postgres utilities: `../../../postgres/...`
- server utils: `../../../utils/...`
- resolverTypes: `../resolverTypes`
- old shared helpers (not yet migrated): `../../mutations/helpers/<helper>`

### Rate limiting / higher-order resolver wrappers
Old mutations sometimes wrap their resolve function with a `rateLimit({perMinute, perHour})` higher-order function from `packages/server/graphql/rateLimit.ts`. In the SDL-first architecture, this pattern is replaced by a graphql-shield rule in `packages/server/graphql/public/permissions.ts`.

Migration:
```ts
// OLD (in mutations/foo.ts)
resolve: rateLimit({perMinute: 10, perHour: 20})(async (_source, args, context) => { ... })

// NEW: resolver has no wrapper; add to permissions.ts instead:
denyPushInvitation: rateLimit({perMinute: 10, perHour: 20}),
```

The `rateLimit` rule in permissions.ts is imported from `./rules/rateLimit` (graphql-shield based), which is distinct from the old middleware wrapper. Both use the same `rateLimiter` from context but the shield version returns a `GraphQLError` on violation rather than a standardError payload.

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

### IMPORTANT: Always include `{error: {message: string}}` in Payload source types
Every `*Payload` source type (the non-Success union variant) **must** include `| {error: {message: string}}` in its union, because the mutation resolver can return `standardError(...)` or `{error: {...}}` on failure. This applies to any type whose SDL name ends in `Payload` (as opposed to `Success` types, which are the guaranteed-success branch of a discriminated union and do not need the error case).

All field resolvers in a Payload type must guard with `if ('error' in source) return null` before accessing success-branch fields.

`*Success` types (e.g. `JoinMeetingSuccess`, `FlagReadyToAdvanceSuccess`) do **not** need the error case — they are always the success branch.

---

## TypeScript & Type Safety

- **Never use `any`** without strong justification. Don't remove type annotations.
- **Use generated types** from the GraphQL schema and database — don't manually define types that come from codegen or `postgres/types/`.
- **Handle null/undefined** for all nullable types. Use optional chaining (`?.`) and nullish coalescing (`??`).
- **Avoid database ORM classes.** Use plain objects (POJOs) for database inserts/updates — classes don't account for differences between inserts, updates, and reads. POJOs give better type checking with Kysely.
- **Create objects in a single call** instead of building them incrementally across multiple statements. Cleaner for the compiler and immediately shows if variables are unused.
- **Kysely: `undefined` skips the field, `null` sets it to NULL.** The DB driver ignores `undefined` values but does _not_ ignore `null`. Use this distinction intentionally.
- **Use `Number(id)`** when passing string IDs to PostgreSQL integer columns. PG may accept strings, but not every dataloader will.

## DataLoader Best Practices

- **Always use DataLoaders** for related data fetching in resolvers — never query the DB directly from a resolver.
  - Helper functions: `packages/server/dataloader/select.ts`
  - Type definitions: `packages/server/dataloader/types/index.ts`
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
- **Use queries for read operations, mutations for writes.** Don't use mutations for operations that only read data.
- **Store data in the database** rather than computing values on-the-fly in code.

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
