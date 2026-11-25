---
name: server-testing
description: Running and writing packages/server jest tests — how CI splits unit and integration suites, testing real schema and permission rules in-process, auth cookies after joining a team, flaky suites, and scanning or rewriting code with scripts (git grep, AST scripts, biome). Use when writing or running server tests or codemod-style scripts.
---

# Server tests

## What CI runs

- **`unit`:** `pnpm test:server --testPathIgnorePatterns /node_modules/ packages/server/__tests__/`. `--testPathIgnorePatterns` takes both values after it, so this is every server suite except the HTTP ones in `packages/server/__tests__/`. It takes about 10 s locally, so run all of it before pushing, not only the suites next to your change; also grep `jest.mock(` for any package whose import shape you changed.
- **`integration`:** `pnpm test:server packages/server/__tests__/` against a built, running server. Locally `npx jest __tests__/` is not that: it matches every `__tests__` folder.
- Run jest from `packages/server` with `POSTGRES_DB` and `REDIS_URL` pointed at a database of its own (`pnpm dev --isolated` makes one). jest's `globalSetup` writes to whatever database it's given: it truncates tables and disables `check_meeting_overlap`.
- An older database works once migrated: `./node_modules/.bin/kysely migrate:latest` from the repo root with the `POSTGRES_*` env set. It also needs the embedding tables (`scripts/toolbox/createEmbeddingsTables.js`), or the embedder, `templateSearch` and `getPagesByRRF` suites fail.
- Known flakes under load: `resetPassword` (sleeps 2 s against jest's 5 s limit), `FileStoreManager`, `utils/tiptap/rehostExternalAssets`, `embedder/findRelatedDiscussions` in a parallel run. Rerun a failed suite alone before suspecting the change. `jiraServerIntegration` fails against a server in a container because its mock Jira listens on the host's 127.0.0.1.
- Jest has no usable `require.cache`; don't assert module loading with it.

## Testing real schema and rules in-process

Server jest can't import `graphql/public/rootSchema` or `graphql/public/resolvers` (they use webpack's `require.context`), which is why tests `jest.mock` rootSchema. To run real permission rules or a real subscription without a server:
- `buildSchema(readFileSync('graphql/public/schema.graphql'))` (about 200 ms; generated and gitignored, so build it first), then `addResolversToSchema({schema, resolvers: composeResolvers({Subscription: {...}}, permissions, schema), inheritResolversFromInterfaces: true})`. Rules wrap the default resolver of any type you don't pass.
- Don't import `graphql/public/types/User.ts` unless needed: it pulls in `utils/embeddingResponder.ts`, which opens a Redis subscriber at import time, and jest never exits. If a test subscribes, quit `getPubSub().publisher` and `.subscriber` in `afterAll`.
- "X defined in resolvers, but not in schema" means the generated `schema.graphql`/`resolverTypes.ts` are older than the code; regenerate them.

## HTTP tests

- **`sendPublic` skips schema validation**, like production's persisted operations, so a query selecting a removed type returns `{}` instead of a validation error. See the `graphql` skill.
- **A `signUp()` cookie predates any team the user joins later.** Its token's `tms` lists only the signup team, so team-gated mutations after `acceptTeamInvitation` fail `isTeamMember`. Use the accept response's new cookie, but extract only `__Host-Http-authToken` (as `inviteToTeam.test.ts` does): the header starts with a readable `authToken=…; Expires=…` cookie whose comma breaks the rest when passed back whole, and the server then sees no token.

## Scanning and rewriting code

- **`git grep -E` has no `\b`.** ERE silently matches nothing for a word-boundary pattern, which looks like a clean result. Use `git grep -P`, or `-wE` when the whole match is the word. After a scan that finds nothing, check the pattern against a line you know matches. String GraphQL documents in tests aren't checked by tsc or the Relay compiler, so the integration suite is their backstop.
- **TypeScript 7 has no JS compiler API**, so an AST script can't `require('typescript')`. Use `@babel/parser` from `node_modules/.pnpm/@babel+parser@<version>/node_modules/@babel/parser` with `plugins: ['typescript']` (add `'jsx'` only for `.tsx`; it breaks `<T>x` casts). When splicing text by node offsets, a typed `Identifier`'s `end` includes its annotation, so replace `start..start + name.length`.
- **Biome walks gitignored files.** The root `biome.jsonc` sets `vcs.enabled: false`, so `biome check --write <dir>` also rewrites caches and generated data in that directory. Pass explicit source paths.
- Scripts node runs directly are `.mts` (see `scripts/tsconfig.json`): full relative import extensions and erasable syntax only. App code can't be imported natively; load it with `createRequire(import.meta.url)` after `require('sucrase/register')`.
