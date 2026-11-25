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

### TypeScript checking
Use `npx tsc -p packages/server/tsconfig.json --noEmit`. As of TypeScript 7, `tsc` *is* the native
(Go) compiler, so `tsgo` / `@typescript/native-preview` are gone — don't reintroduce them.

### Deprecated `/database` directory — always use `postgres/types/`
All classes/types in `packages/server/database/types/` are **deprecated**. When writing source type interfaces for `public/types/` resolvers, always import from `packages/server/postgres/types/NewMeetingPhase.d.ts` (or other files in `postgres/types/`) instead. If an existing file imports from the `database/` directory, flag it and replace the import.

If a codegen mapper references a type from the `database/` directory, replace it with the equivalent interface from `postgres/types/NewMeetingPhase.d.ts`.

### Field resolvers with IDs vs full objects
When a mutation returns IDs (not full objects), the payload type source needs custom field resolvers:
- Store the ID in the source (e.g. `{orgId, teamIds}`)
- In the type source file, use dataLoader to resolve the full object
- Add a mapper entry in `codegen.json`
- Use `loadNonNull` when the SDL field is non-nullable (e.g. `meeting: NewMeeting`), `load` when nullable

For example:
```ts
export type FooPayloadSource = {orgId: string; teamIds: string[]}

const FooPayload: FooPayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  // loadMany returns (T | Error)[] — always filter with isValid and make the resolver async
  teams: async ({teamIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
  }
}
```

### Date arithmetic: use the `ms` package
When computing future/past dates, use `ms` from the `ms` package instead of manual millisecond math:
```ts
import ms from 'ms'
const maxAllowed = new Date(Date.now() + ms('60d'))
```

### Mutation return types and errors
New mutations return an `XPayload` object type directly, non-null (`startFoo(...): StartFooPayload!`), never a union or a `*Success` name. A subscription payload field is named after its type (`StartFooPayload: StartFooPayload`), and `publish` passes that name.

A failure throws `new GraphQLError(message, {extensions: {code}})`. `scripts/biome/requireGraphQLErrorCode.grit` rejects a `GraphQLError` without a code, and `ParabolGraphQLErrorCodes` in `packages/types/augments/index.d.ts` types it. API clients see the message and `extensions`, so keep internals and upstream error objects out of both. Pick the code by what the caller should do next:
- `UNAUTHENTICATED`: no valid session or token
- `FORBIDDEN`: the viewer, their org or their PAT isn't allowed. Prefer a rule in `permissions.ts`
- `NOT_FOUND`: what an argument points at doesn't exist
- `BAD_USER_INPUT`: the arguments are wrong whatever the state (format, length, ids that don't belong together, the wrong meeting type)
- `CONFLICT`: the arguments are fine but the current state rules them out (the meeting already ended, the name is taken, the list is full)
- `TOO_MANY_REQUESTS`: a rate limit or quota
- `SERVICE_UNAVAILABLE`: an AI provider or integration failed, so a retry may work
- `NOT_IMPLEMENTED`: this server isn't set up for the feature
- `INTERNAL_SERVER_ERROR`: a bug the server caught itself. Logging, tracing, the SLO counter and the client's error reports treat it like a crash, but its message still reaches the client
- A domain code (`UPGRADE_REQUIRED`, `UNAPPROVED_UNLINK`, …) only when the client branches on it

A plain `Error` should only ever come from something nobody caught. Yoga replaces its message with "Unexpected error." and adds the trace id as `extensions.traceId`. A bug the code detects itself ("Unhandled recurring meeting type", an insert that returned no row) is still a `GraphQLError` coded `INTERNAL_SERVER_ERROR`, so its message reaches the client; `utils/isExpectedError.ts` decides by code what logging and the SLO count as unexpected.

Where an error comes from changes what the caller sees (graphql 16 + Yoga 5 + @graphql-tools/executor):
- **Scalar `parseValue`** (variables): a plain Error becomes "Unexpected error."; a GraphQLError keeps its code inside `Variable "$x" got invalid value …`.
- **`parseLiteral`** in an ad hoc op: a GraphQLError is reported as thrown; a plain Error becomes GRAPHQL_VALIDATION_FAILED. In a persisted op, `valueFromAST` swallows the throw and the caller gets `Argument "x" has invalid value …` with no code. It also runs twice per validated request (validation, then execution), so keep parsing stateless: a `/g` regex fails the second call.
- **`serialize`:** the executor rethrows any GraphQLError as a plain Error, so a serialize failure is always "Unexpected error.".
- **Yoga's validation cache** is keyed by document text, so probes need unique documents (an operation name will do).
- **A shield rule that returns a string** becomes a plain `new Error(res)`; rules must return coded GraphQLErrors themselves.
- Biome GritQL `message` strings: no backslash escapes (after `\"` the rest of the message mangles). Suppress one plugin with `// biome-ignore lint/plugin/<grit file name>: reason`.

### Renaming types and fields: stale clients

`yoga.ts` runs `usePersistedOperations({skipDocumentValidation: true})`, so an old tab's persisted document runs unvalidated against the new schema. graphql-js silently skips a field the type no longer has and a fragment whose type condition no longer exists. Nothing errors; data goes missing.
- Relay flattens a `@relay(mask: false)` spread whose type matches its parent, so payload type names appear in persisted text only in union arms and masked named fragments.
- Subscription payload field names and the `fieldName` a mutation publishes are what old clients key on: renaming a field's type is invisible to them, renaming the field is not.
- PAT/OAuth callers send validated ad hoc operations, so the same rename fails loudly for them.
- Server HTTP tests skip validation too (`sendPublic` persists each query and sends its `docId`), so a test still selecting a deleted `... on XSuccess` gets `{}` and fails later with `Cannot read properties of undefined`. When you delete a type, grep the test queries for its name.
- Before renaming, grep `queryMap.json` for `on <Type>` and the field name. Turn a union into an object type while keeping the arm's type name; rename that type only after old clients have drained.

---

## Server gotchas

- **Auth token claims are the trusted copy.** `authToken.tms` is what a session may see. When code disagrees with it (a resolver listing teams from the database while the `Team` rules check `tms`), make that code agree with the token. Don't re-read teams per request and don't re-issue the token or set cookies from a query field: the token refreshes on the socket upgrade (`getFreshTokenIfNeeded`), on membership mutations and in `refreshSession`, and a stale token until then is the accepted trade-off.
- **The schema is chosen per request.** `yoga.ts` passes `schema: ({authToken}) => su ? getFullSchema() : rootSchema`. envelop's `setSchema` is orchestrator-wide, not per request, and every swap fires each plugin's `onSchemaChange`. A plugin that wraps `field.resolve` in place must dedupe by field object (as `useAuditLogs` and `@envelop/on-resolve` do), not by schema, or it wraps fields again on every swap. A per-request schema must already declare every directive a plugin would add (`@stream`), or the plugin rebuilds the schema on each request.
- **Nested GitHub/GitLab/Linear schemas are pruned in prod builds** to what persisted operations use (`scripts/webpack/utils/getNestedUsage.js`, `pruneNestedTypeDefs.js`); `utils/useNestedSchemaFallback.ts` swaps in the full schema when an op needs a pruned field. Relay's persisted text keeps client-extension fields (`service` on TaskIntegration), so only a field the endpoint's own schema has counts as missing. Check new nested-type resolvers are covered by `getResolverUsage`.
- **Nested query documents use unprefixed type names.** `nest-graphql-endpoint` forwards `utils/githubQueries/*.graphql` to GitHub as written, so they use `Issue`, not `_xGitHubIssue`, while runtime `__typename` is always prefixed. `scripts/prefixGitHubTypenames.js` prefixes the generated `githubTypes.ts` to match. The IDE flags unprefixed names as "Unknown type"; that's a false positive. Same for GitLab and Linear.
- **Dataloaders must not import `integrations/platform/registry.ts`.** It imports every server integration, and GitHub's reaches `rootSchema`, which would drag the whole schema into every module and test that imports a loader. When a loader must dispatch by service, add a table of per-service functions in `integrations/platform/` (as `createOAuth2Manager.ts` and `loadIssues.ts` do) taking a bare `{get}` loader, teamId and userId, never GraphQL `context`/`info`. GitHub, GitLab and Linear reads need `info`, so they can't sit behind a loader.
- **`@graphql-tools/utils` is overridden for every package** in `pnpm-workspace.yaml`. Its major must match what graphql-yoga's `@graphql-tools/executor` expects; a mismatch makes every `@include`/`@skip`/`@defer(if: $var)` throw "was provided the variable … which was not provided a runtime value". When touching the override or bumping Yoga, check `pnpm why @graphql-tools/executor`.
- **Feature flags are defined in code**, in `FEATURE_FLAGS` in `packages/server/utils/featureFlags.ts`; the `FeatureFlag` table is gone. `FeatureFlagOwner` still holds grants, keyed by `featureName`.
- **`TeamMember.updatedAt` isn't when someone left.** A mid-2025 migration rewrote it on every row, there's no `removedAt`, and rejoining reuses the row. For membership history use `OrganizationUser.joinedAt/removedAt` or `OrganizationUserAudit`, or add a real `removedAt`.
- **Server fetch is `@whatwg-node/fetch`, a `node:http` ponyfill, not undici.** It takes `agent` in RequestInit (which also forces the `node:http` path). `redirect: 'follow'` has no redirect cap and copies every header, `Authorization` included, to the new origin, and it resolves `file:`, `data:` and `blob:` URLs. Fetch a user-supplied URL with `utils/fetchUntrusted.ts`.
- **Lazy-load server modules with `await import(/* webpackMode: "eager" */ '…')`, never `require`.** Put the boundary at an async call site; a sync getter becomes async and memoizes one promise (`x ??= make()`).

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
