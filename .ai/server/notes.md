# Server GraphQL Migration Notes

## SDL-First Migration Pattern

Old mutations live in `packages/server/graphql/mutations/`. New mutations go in `packages/server/graphql/public/mutations/`.

### Migration steps for each mutation

1. **Create** `public/mutations/<name>.ts` — extract the `resolve` function body, change signature to `MutationResolvers['<name>']` from `../resolverTypes`
2. **Remove** from `packages/server/graphql/rootMutation.ts` (imports + fields object)
3. **Delete** old `mutations/<name>.ts`
4. **Delete** old `types/<PayloadType>.ts` if only used by that mutation

New mutations are auto-discovered via `require.context('./mutations', ...)` in `resolvers.ts` — no explicit registration needed.

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

### Import paths from `public/mutations/`
- postgres utilities: `../../../postgres/...`
- server utils: `../../../utils/...`
- resolverTypes: `../resolverTypes`
- old shared helpers (not yet migrated): `../../mutations/helpers/<helper>`
