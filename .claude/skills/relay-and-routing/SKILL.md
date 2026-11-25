---
name: relay-and-routing
description: How the client loads data and routes — Relay pitfalls (@alias onCompleted shape, client-only fields like localStage, @catch error messages, stale persisted operations, the retro demo's fixtures), TanStack Router gotchas, React.lazy reveal delays and what page-load performance work should target. Use when writing Relay queries, fragments or mutations, touching routes or loaders, or working on load performance.
---

# Relay and routing

## Relay

### `@alias` changes what `onCompleted` sees

`...Foo_team @relay(mask: false) @alias` on a mutation's root field nests `onCompleted` data under the fragment name: `res.root.Foo_team.meeting`, not `res.root.meeting`. The response on the wire is still flat, so a websocket frame that shows the field proves nothing about what the handler reads. Store updaters and unaliased subscription spreads are unaffected. Readers typed through `CompletedHandler` (defaults to `any`) or cast `as any` keep compiling and silently read `undefined`. When adding `@alias` to a mutation spread, grep every `res.<rootField>` reader and remove the casts. When "the response has the field but the client ignores it", check for an alias first.

The facilitator never receives their own end-meeting subscription event (it's published with `mutatorId`), so `onCompleted` is their only redirect.

### Nothing under a client-only field is fetched

`localStage` and `localPhase` are client schema fields (linked by `utils/relay/updateLocalStage.ts` from `phases.stages`). Relay never asks the server for anything selected only under them: not the `__isX` flag an interface condition needs, and not even a plain scalar. `localStage { ... on DiscussionThreadStage { discussionId } }` and `localStage { phaseType }` both come back `undefined`, with no compiler error.

Select the field on the server path (`phases { stages { id ... on ConcreteStage { field } } }`) and look the stage up by `localStage.id`, or spread one `@relay(mask: false)` stage fragment under both `phases.stages` and `localStage`, as `RetroDiscussPhase_stage` does. Use concrete type conditions, not the interface.

Same family: a mutation that first links a record a view reads, such as `joinMeeting` making `viewerMeetingMember` non-null, must read back that view's whole fragment. Selecting only `id` leaves the rest undefined and crashes the view.

### `@catch` drops error messages

Relay 21's `@catch` gives `{ok: false, errors}` with each error's `message` removed on purpose; everything else, `extensions` included, survives. Atmosphere copies each message into `extensions.message`, and `utils/relay/getCaughtErrorMessage.ts` reads it. When a component needs a server error's text, use `@catch` + `getCaughtErrorMessage`, not an errors-as-data field.
- `@catch` works on a `@connection` field in a `usePaginationFragment` fragment. A failed later page nulls the whole client connection, so loaded items disappear and the error shows.
- The field must be nullable for the error to stop there; a non-null field's error nulls the nearest nullable ancestor, and a `@catch` below it never runs.
- `@throwOnFieldError` doesn't help: it throws a generic "Unexpected response payload".

### Stale clients skip schema validation

Persisted operations run with `skipDocumentValidation`, and old tabs stay open for days. graphql-js then silently drops a field the type no longer has and any fragment whose type no longer exists: no error, just missing data. Before renaming a type or field, grep `queryMap.json` for `on <Type>` and the field name. Turn a union into an object type while keeping the arm's type name, and rename only after old clients have drained. See the `graphql` skill for the server side.

### The retro demo needs every selected field

The retro demo's `ClientGraphQLServer` returns hand-built fixtures (`modules/demo/initDB.ts`). A field missing from a fixture makes the fragment suspend again on every StrictMode effect re-run, which shows as the app-root Suspense flipping and the Start Demo dialog never settling (dev only). When you add a field under `RetroMeeting_meeting`, add it to the fixture too (aliases need their own key). Diagnose with "RelayResponseNormalizer: Payload did not contain a value for field" warnings. Demo payloads carry `extensions.is_final`, because the local network never sends `@defer` increments.

## Routing (TanStack Router)

Every URL is declared in `routing/routes`. A page's query starts in its route's loader with `context.queryRefs.load` (`routing/queryRefs.ts`), and its `*Route.tsx` reads it with `getRouteApi(...).useLoaderData()` + `useQueryRefLease`.

- **Never use TanStack's `<Navigate>`.** It navigates whenever its props object changes, i.e. every render, and a component kept mounted during a pending navigation loops ("Maximum update depth"). Use `routing/Redirect`, which navigates once per destination.
- **A navigation to the current href with the same history state is skipped**, mask included. A mask over the current page needs a distinct `state` key.
- **`useLocation()` in the old page reports the new location** while loaders hold the old screen.
- `location.hash` has no `#`; `location.search` is a parsed object and the raw string is `location.searchStr`. The app parses search as plain strings (`routing/searchParams.ts`) so values like `007` survive.
- **A typed `to` rejects literals that aren't route paths** but accepts a `string`. Runtime paths with query or hash go through `navigate({href})`, and on a `Link` through `routing/hrefOptions`.
- A parent route whose only child is `$` warns on links to the bare path; add a `path: '/'` index child.
- `useNavigate` doesn't subscribe to location, so render-time `window.location` reads go stale; use `useMatchRoute`/`useLocation`.
- A `defaultPendingComponent` wraps every match in Suspense; swapping sibling routes reuses that boundary and the router's transition keeps the old page up, so the default pending state never shows. A route's own `pendingComponent` on a new child match does show.
- On a cold load `beforeLoad` runs before React renders, so an `addSnackbar` there is lost. Carry the notice in the redirect's `state` instead.
- A search-dependent loader uses `loaderDeps: ({search}) => ({search})` and parses `location.searchStr`.
- `getRouteApi(id)` ids include pathless layout ids (`/tipTapLayout/privateLayout/dashboardLayout/team/$teamId`), and tsc checks them.
- In jest, router-core writes `self.__TSR_ROUTER__` and calls a bare `scrollTo`; `routing/__tests__/testRouter.tsx` handles both. Route elements are memoized, so re-rendering `<RouterProvider>` doesn't re-render them.

## Load performance

- **Chunks aren't the cost; data waterfalls are.** Parabol is a PWA whose service worker precaches every build file, so chunks come from Cache Storage in a few ms. Count GraphQL queries that wait on each other, not network hops. When adding latency in a trace, add it only to `/graphql` and the graphql-ws socket. Leave chunk preloading, naming and `lazy()` placement out of perf work; only first-ever visits pay for chunks.
- **`React.lazy` always suspends on its first render**, even when its chunk is cached. In a blocking render that commits the nearest fallback, and react-dom then throttles the reveal until 300 ms after it, so every route-level `lazy()` can cost up to 300 ms on a cold load. Use TanStack's `lazyRouteComponent` (call `X.preload?.()`), which renders synchronously once loaded. A nested `<Suspense fallback={null}>` also restarts that window.
- Judge client performance with production RUM data; local and lab numbers don't carry over.
