# Server GraphQL Migration Notes

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
