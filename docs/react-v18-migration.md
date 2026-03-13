# React 18 Migration Plan

Incremental migration of Parabol from React 17.0.2 to React 18, including React Router v5 to v6. Each PR targets fewer than 1,000 lines of diff to keep reviews manageable.

## Current State

- **React**: 17.0.2 (pinned via root `package.json` resolutions)
- **React DOM**: 17.0.2
- **@types/react**: 17.0.2
- **React Router**: v5.2.1 / react-router-dom v5.3.0
- **TypeScript**: 5.9.3 with `jsx: "react-jsx"` (automatic transform, already React 18 compatible)
- **Bundler**: Webpack 5 with Sucrase (`jsxRuntime: 'automatic'`) and Babel
- **Testing**: Jest 29 with SWC transformer; Playwright for E2E
- **Monorepo**: pnpm workspace with packages: client, server, mattermost-plugin, embedder, integration-tests, types

## Strategy: Hybrid (Compatibility-First + Version Flip + Post-work)

1. **Phase 1 — Pre-work**: Make code compatible with React 18 while still on React 17. Each PR is safe to merge and deploy independently.
2. **Phase 2 — Version Bump**: Smallest possible PR to flip to React 18 + fix compilation.
3. **Phase 3 — React Router v5 → v6**: Incremental migration of 108 files that use React Router.
4. **Phase 4 — Polish**: StrictMode, Mattermost plugin, final cleanup.

---

## Audit Summary

### What's already compatible (no changes needed)

- Relay v20 — full React 18 support
- MUI v6 / Radix UI v1 / Emotion v11 / Tailwind v4 — all compatible
- TipTap v3 — compatible
- @tanstack/react-table v8 — compatible
- @stripe/react-stripe-js — compatible
- All @react-email/* packages — compatible
- Functional component architecture (~3,168 of ~3,179 client TS/TSX files)
- Automatic JSX transform already configured in tsconfig and Sucrase
- Jest 29 + SWC transformer — compatible
- Webpack 5 + React Refresh plugin v0.5.16 — compatible

### What must change

| Category | Count | Effort |
|---|---|---|
| `ReactDOM.render()` → `createRoot()` | 1 file | Trivial |
| `react-beautiful-dnd` (React 18 incompatible) | 15 files | Low (drop-in replacement) |
| Class components | 11 files (889 LOC) | Low-Medium |
| `React.FC` type (implicit children removed in v18 types) | 2 files | Trivial |
| `useEffect` cleanup / StrictMode safety issues | ~10 files | Medium |
| React Router v5 APIs | 108 files | High |
| Minor dependency updates | 3 packages | Low |
| Mattermost plugin | 37 React files | Low (isolated) |

### Corner cases requiring special attention

| Issue | Detail | Resolution |
|---|---|---|
| `ErrorBoundary` must stay as class | React requires class components for `componentDidCatch` | Keep as class; do not convert |
| `react-swipeable-views` custom fork | Tarball from `mattkrick/react-swipeable-views` — 4 files | Test with React 18; replace with CSS scroll-snap if broken |
| `react-virtualized` internal class components | 1 file (`TeamArchive.tsx`) | Test with React 18; replace with `@tanstack/react-virtual` if StrictMode issues |
| Relay subscription double-fire | `useSubscription.ts` registers queries in `useEffect` | Add guard to prevent double-registration in StrictMode |
| WebSocket `resolve()` double-call | `createWSClient.ts` connected handler | Add idempotency guard |
| Module-level `addEventListener` | 11 SSO/OAuth client managers attach `message` listeners at import time | Outside React lifecycle — safe from StrictMode but should be audited |
| `withForm.tsx` ref mutation in render | `fieldsRef.current = fields` set during render | Move to `useEffect` or convert component |
| `PokerCardDeck.tsx` missing cleanup | `addEventListener` in `useEffect` with no `removeEventListener` in cleanup | Add cleanup return |
| `useMeetingMusicSync.ts` missing cleanup | `play` event listener added without cleanup | Add cleanup return |
| `react-dom-confetti` | Small celebration animation lib (4 files) | Compatible with React 18 — peer dep `^16.3.0`, uses simple DOM refs |
| `@babel/preset-react` runtime | Not explicitly set to `'automatic'` | Set explicitly during version bump |

---

## Phase 1: Pre-work (safe on React 17)

### PR 1 — Replace `react-beautiful-dnd` with `@hello-pangea/dnd` — DONE

**~30 lines changed | Risk: LOW | Branch: `chore/react-18-migration-pr-1`**

`@hello-pangea/dnd` is a maintained fork of `react-beautiful-dnd` with an identical API and full React 18 support. This is a mechanical find-and-replace of import paths.

**Important:** Use `v16.6.0` (not v17+ or v18+) since v17+ dropped React 17 support and uses `useId` which is a React 18-only hook. v16.6.0 has peer deps `^16.8.5 || ^17.0.0 || ^18.0.0`, so it works on React 17 now and on React 18 after the version bump in PR 7.

**Changes:**
- Update `package.json`: remove `react-beautiful-dnd`, add `@hello-pangea/dnd@^16.6.0`
- Update `@types/react-beautiful-dnd` → types are bundled in `@hello-pangea/dnd`
- Find-and-replace imports in 15 files:

```
packages/client/components/RetroSidebarDiscussSection.tsx
packages/client/components/DashNavList/LeftNavTeamsSection.tsx
packages/client/modules/teamDashboard/components/TaskColumn/TaskColumn.tsx
packages/client/modules/teamDashboard/components/AgendaList/AgendaList.tsx
packages/client/modules/meeting/components/TemplatePromptList.tsx
packages/client/modules/meeting/components/TemplateScaleValueItem.tsx
packages/client/modules/meeting/components/TemplateScaleValueList.tsx
packages/client/modules/meeting/components/TemplateDimensionItem.tsx
packages/client/modules/meeting/components/TemplateDimensionList.tsx
packages/client/modules/meeting/components/TemplatePromptItem.tsx
packages/client/containers/TaskCard/DraggableTaskWrapper.tsx
packages/client/components/TimelinePriorityTasks.tsx
packages/client/components/TaskColumns/TaskColumns.tsx
packages/client/components/PokerSidebarEstimateSection.tsx
packages/client/components/NullableTask/NullableTask.tsx
```

**Testing:** Manually test all 9 drag-and-drop contexts:
1. Task kanban columns (move between status columns + reorder within)
2. Retrospective discuss topic reordering
3. Poker estimate task reordering
4. Agenda item reordering
5. Template prompt reordering
6. Template scale value reordering
7. Template dimension reordering
8. Left nav team reordering
9. Timeline priority task reordering

---

### PR 2 — Fix `React.FC` types and explicit `children` typing - DONE

**~50 lines changed | Risk: LOW**

React 18's `@types/react` removes the implicit `children` prop from `React.FC`. Fix the 2 files that use `React.FC` and audit forwardRef components for implicit children.

**Changes:**

1. Convert `React.FC` to plain function declarations:
   - `packages/client/components/TeamAvatar/TeamAvatar.tsx`
   - `packages/client/ui/Menu/Menu.tsx`

2. Audit forwardRef components (~85 files) for implicit children usage. Where a component destructures `children` from props without it being declared in the Props type, add `children: ReactNode` to the type.

**Example conversion:**
```tsx
// Before
export const TeamAvatar: React.FC<TeamAvatarProps> = ({teamName, teamId, className}) => {

// After
export const TeamAvatar = ({teamName, teamId, className}: TeamAvatarProps) => {
```

---

### PR 3 — Convert class components to functional (batch 1: simple) - DONE

**~400 lines changed | Risk: LOW**

Convert 6 straightforward class components to functional components with hooks. These are small (48-87 LOC each) and use only simple state + lifecycle patterns.

**Files:**
| File | LOC | Key conversion |
|---|---|---|
| `components/Tabs/Tabs.tsx` | 87 | State → `useState` |
| `components/Radio/Radio.tsx` | 48 | State → `useState` |
| `components/AvatarInput.tsx` | 69 | `createRef` → `useRef`, state → `useState` |
| `components/AddTeamMemberModalSuccess.tsx` | 60 | `componentWillUnmount` timer cleanup → `useEffect` |
| `components/TimelineEventDate.tsx` | 54 | `componentWillUnmount` timer cleanup → `useEffect` |
| `components/DelayUnmount.tsx` | 79 | `getDerivedStateFromProps` → `useEffect` with state |

---

### PR 4 — Convert class components to functional (batch 2: complex) - DONE

**~500 lines changed | Risk: MEDIUM**

Convert the remaining class components that have more nuanced patterns. **`ErrorBoundary.tsx` stays as a class** — React requires it for `componentDidCatch`.

**Files:**
| File | LOC | Key conversion |
|---|---|---|
| `components/AtmosphereProvider/AtmosphereProvider.tsx` | 50 | WebSocket lifecycle → `useEffect` |
| `components/MasonryCSSGrid.tsx` | 93 | `createRef` → `useRef`, `componentDidMount` resize listener → `useEffect` |
| `utils/relay/withForm.tsx` | 157 | HOC with state/refs — convert to custom hook `useForm` |
| `utils/relay/withMutationProps.tsx` | 118 | HOC with mutation state — convert to custom hook `useMutationProps` |

**Notes:**
- `withForm` and `withMutationProps` are HOCs wrapping other components. Converting these to custom hooks (e.g., `useForm`, `useMutationProps`) will also require updating all call sites. Audit call sites first to assess the blast radius.
- `ErrorBoundary.tsx` — no changes. It's already well-structured with `componentDidCatch` and `componentDidUpdate`.

---

### PR 5 — Fix `useEffect` cleanup and StrictMode safety - DONE

**~300 lines changed | Risk: MEDIUM**

React 18 StrictMode double-invokes effects in development to catch bugs. Fix patterns that would break or misbehave under double-invocation.

**Files and fixes:**

1. **`components/PokerCardDeck.tsx`** (lines 143-145)
   - `document.addEventListener('touchstart', ...)` and `click` with empty deps and no cleanup
   - Fix: add cleanup function returning `removeEventListener`

2. **`hooks/useMeetingMusicSync.ts`** (line 104)
   - `audioRef.current.addEventListener('play', ...)` with no cleanup
   - Fix: add cleanup return

3. **`hooks/useSubscription.ts`**
   - Calls `atmosphere.registerQuery()` in `useEffect` — will double-register in StrictMode
   - Fix: add guard or use ref to track registration state

4. **`utils/createWSClient.ts`** (line 116)
   - Connected handler calls `resolve()` which could execute twice
   - Fix: add idempotency guard (e.g., `let resolved = false`)

5. **`utils/relay/withForm.tsx`** (line 137)
   - `fieldsRef.current = fields` mutated during render
   - Fix: move to `useEffect` (if already converted in PR 4, apply there)

6. **`components/SpotlightResultsRoot.tsx`**
   - `groupIdRef.current = nextGroupId` mutated in render path
   - Fix: move to `useEffect`

**Testing:** Enable `<React.StrictMode>` locally in `Root.tsx` during development to verify these fixes. Do not ship StrictMode yet (that's PR 16).

---

### PR 6 — Update minor dependencies — DONE

**~30 lines changed | Risk: LOW**

Update third-party libraries that need newer versions for React 18 compatibility.

**Changes:**

1. **`react-textarea-autosize`**: 7.1.0 → 8.5.9
   - Files: `components/EditableText.tsx`, `TeamPromptEditablePromptModal.tsx`
   - `maxRows` prop is unchanged; both files work without API changes
   - Removed deprecated `@types/react-textarea-autosize` (v8 bundles its own types)
   - Removed ambient `declare module 'react-textarea-autosize'` from `packages/types/globals/index.d.ts` (was hiding real types)
   - Fixed `useForm` hook `onChange` type: widened from `ChangeEvent<HTMLInputElement>` to `ChangeEvent<HTMLInputElement | HTMLTextAreaElement>` (v8's real types caught this mismatch)

**Deferred to post-React 18 (PR 7+):**

2. **`react-swipeable-views`** (custom fork): deferred to after Phase 2
   - Uses custom fork from `mattkrick/react-swipeable-views` with peer dep `react: 17.0.2`
   - Upstream is deprecated and unmaintained (GitHub issue #676)
   - Known React 18 compatibility issues: uses `UNSAFE_componentWillReceiveProps`
   - 4 consuming files: `ReflectionWrapperMobile.tsx`, `EstimatePhaseArea.tsx`, `StageTimerModal.tsx`, `ScopePhaseArea.tsx`
   - **Recommendation:** Replace with CSS `scroll-snap` or `react-swipeable-views-react-18-fix` after PR 7 lands React 18 — see PR 17

3. **`react-virtualized`**: deferred to after Phase 2
   - Works with React 18 but emits `findDOMNode` deprecation warnings in StrictMode
   - 1 consuming file: `modules/teamDashboard/components/TeamArchive/TeamArchive.tsx`
   - **Recommendation:** Replace with `@tanstack/react-virtual` when StrictMode is enabled — see PR 17

4. **`react-dom-confetti`**: no action needed
   - v0.2.0 uses simple DOM manipulation via refs, peer dep `react: "^16.3.0"`
   - 4 consuming files: `Confetti.tsx`, `NotFound.tsx`, `UpgradeSuccess.tsx`, `OrgPlanDrawer.tsx`
   - Compatible with React 18 — no code changes or replacement needed

---

## Phase 2: Version Bump

### PR 7 — Bump React 17 → 18 and fix TypeScript compilation — DONE

**~120 lines changed | Risk: HIGH**

This is the critical PR. All Phase 1 pre-work de-risks this to the maximum extent possible.

**Changes (actual):**

1. Updated root `package.json` resolutions, dependencies, and devDependencies to React 18.3.x and @types/react 18.3.x
2. Updated `packages/client/package.json`, `packages/server/package.json`, and `packages/mattermost-plugin/package.json` (deps, devDeps, overrides)
3. `@babel/preset-react` change was **NOT needed** — JSX transform uses `@sucrase/webpack-loader` with `jsxRuntime: 'automatic'`, not `@babel/preset-react`
4. Removed `declare module 'react/jsx-runtime'` ambient declaration from `packages/types/globals/index.d.ts` — `@types/react@18` provides proper typed exports
5. Ran `pnpm install` — lockfile regenerated with React 18.3.1, @types/react 18.3.28, @types/react-dom 18.3.7
6. Fixed TypeScript compilation errors (6 distinct issues):
   - `forwardRadix.tsx`: Replaced removed `RefForwardingComponent` with `ForwardRefRenderFunction` + `PropsWithoutRef` cast for React 18's stricter `forwardRef` signature
   - `useCallbackRef.ts`: Added explicit parameter type (React 18 stricter callback inference)
   - `useRefState.ts`: Added `SetStateAction<S>` type annotation + resolved function updaters correctly
   - `ActionMeeting.tsx`, `RetroMeeting.tsx`, `PokerMeeting.tsx`, `BottomControlBarTips.tsx`, `NotificationPicker.tsx`: Cast `LazyExoticPreload<any>` lookups to `any` (tsgo doesn't resolve `CustomComponentPropsWithRef<any>` the same as tsc)
   - `Root.tsx`: Added module augmentation for `BrowserRouterProps.children` (@types/react-router-dom@4.x doesn't declare children for React 18)

**Peer dependency warnings (expected, deferred):**
- `@sereneinserenade/tiptap-search-and-replace` wants `@tiptap/core@^2.x.x` (we use 3.x)
- `@stripe/react-stripe-js` wants `@stripe/stripe-js@^1.44.1` (we use 4.x)

**Testing results:**
- `pnpm --filter parabol-client typecheck` — PASS (0 new errors)
- `pnpm --filter parabol-server typecheck` — PASS (8 pre-existing Kysely errors, unrelated to React)
- `pnpm --filter parabol-client test` — PASS (18/18)
- `pnpm build` — PASS (3 webpack compilations: server 10s, client 20s, graphQL 5s)

---

### PR 8 — Bump `@hello-pangea/dnd` v16 → v18 — DONE

**~10 lines changed | Risk: LOW**

Now that React 18 is installed, upgrade `@hello-pangea/dnd` from `^16.6.0` (the React 17-compatible version used in PR 1) to `^18.0.1` (latest, uses React 18 features like `useId` for better SSR support and concurrent rendering compatibility).

**Changes:**
- `packages/client/package.json`: `"@hello-pangea/dnd": "^16.6.0"` → `"@hello-pangea/dnd": "^18.0.1"`
- Run `pnpm install` to update lockfile

**Why this is separate from PR 1:** v18.0.1 uses `React.useId()` which only exists in React 18. PR 1 had to use v16.6.0 to remain compatible with React 17 during the pre-work phase. Now that PR 7 has landed React 18, we can pick up the latest version.

**Testing:** Smoke test all 9 drag-and-drop contexts (same list as PR 1).

---

### PR 9 — Migrate to `createRoot` API — DONE

**~15 lines changed | Risk: LOW**

Replace the legacy `ReactDOM.render()` call with the React 18 `createRoot()` API.

**File:** `packages/client/client.tsx`

```tsx
// Before
import {render} from 'react-dom'
import Root from './Root'
import './scrollIntoViewIfNeeded'

render(<Root />, document.getElementById('root'))

// After
import {createRoot} from 'react-dom/client'
import Root from './Root'
import './scrollIntoViewIfNeeded'

const container = document.getElementById('root')!
createRoot(container).render(<Root />)
```

---

### PR 10 — Verify email SSR rendering — DONE

**~60 lines changed | Risk: LOW**

`ReactDOMServer.renderToStaticMarkup` is fully compatible with React 18 — no API changes, no import path changes needed. This PR adds unit tests verifying all 5 simple email creators produce correct HTML output, plus a direct `renderToStaticMarkup` smoke test confirming React 18 SSR works correctly.

**Changes (actual):**

1. Added `packages/server/__tests__/emailSSR.test.ts` with 8 tests covering:
   - `emailVerificationEmailCreator` — verifies HTML output, token URL construction, invitation token appending
   - `resetPasswordEmailCreator` — verifies HTML output, reset URL construction
   - `pageSharedEmailCreator` — verifies HTML output, subject line, page name rendering
   - `pageAccessRequestEmailCreator` — verifies HTML output, subject line, page name rendering
   - `teamLimitsEmailCreator` — verifies HTML output for all 3 email types (thirtyDayWarning, sevenDayWarning, locked), correct subject lines
   - Direct `renderToStaticMarkup` smoke test — confirms React 18 SSR API works
2. No changes needed to any email creator files — all imports and APIs are React 18 compatible as-is

**Not unit-tested (covered by integration tests):**
- `notificationSummaryCreator` — requires Relay `ServerEnvironment` with live GraphQL context
- `sendSummaryEmailV2` — requires full `InternalContext` with dataLoader

**Testing results:**
- `pnpm --filter parabol-server typecheck` — PASS
- `npx jest __tests__/emailSSR.test.ts` — PASS (8/8)

---

## Phase 3: React Router v5 → v6

### Overview

108 files use React Router v5 APIs. The migration strategy is to do pre-work on v5 to eliminate indirect/wrapper APIs, consolidating to standard v5 hooks. Then flip to v6 in a single ~900-line PR. No compatibility shims — every file ends up using native v6 APIs.

**Key API changes:**
| v5 | v6 | Files affected |
|---|---|---|
| `<Switch>` | `<Routes>` | 12 |
| `<Route component={X}>` | `<Route element={<X />}>` | 35 |
| `<Route render={fn}>` | `<Route element={<X />}>` | 18 |
| `useHistory()` | `useNavigate()` | 23 |
| `useRouteMatch()` | `useMatch()` | 7 |
| `withRouter(X)` | Use hooks directly | 9 |
| `<Redirect>` | `<Navigate>` | 11+ |
| `exact` prop | Default in v6 (remove) | 6 |
| Custom `useRouter()` hook | Standard v6 hooks | Transitive |

### Pre-work eliminates these APIs while on v5:
- **PR 11:** `withRouter` (9 files) + 8 `RouteComponentProps` usages
- **PR 12-13:** `useRouter` custom hook (100 files) + 6 remaining `RouteComponentProps`
- **PR 14:** `RouterProps['history']` in mutation/subscription infrastructure (~35 files)

### After pre-work, only standard v5 APIs remain:
- `useHistory()` — ~60 component files (direct navigation) + custom `useNavigate` compat hook
- `useLocation()` — unchanged in v6
- `useParams()` — unchanged in v6
- `useRouteMatch()` — ~5 files
- `Switch`/`Route`/`Redirect` — ~16 files
- `matchPath` — ~10 files

---

### PR 11 — Remove `withRouter` HOC → use hooks directly — DONE

**~250 lines changed | Risk: LOW**

Removed all 9 `withRouter` usages from the codebase and replaced with direct hook calls (`useHistory`, `useParams`). Also removed `RouteComponentProps` from all 8 files that used it (DashboardRoot didn't use it). This is pre-work that runs on v5.

**Files changed:**

| File | Change |
|---|---|
| `components/DashboardRoot.tsx` | Removed no-op `withRouter` wrapper |
| `components/SuggestedActionCreateNewTeam.tsx` | `withRouter`/`RouteComponentProps` → `useHistory` hook |
| `components/SuggestedActionTryTheDemo.tsx` | `withRouter`/`RouteComponentProps` → `useHistory` hook |
| `components/SuggestedActionTryRetroMeeting.tsx` | `withRouter`/`RouteComponentProps` → `useHistory` hook |
| `components/SuggestedActionTryActionMeeting.tsx` | `withRouter`/`RouteComponentProps` → `useHistory` hook |
| `components/TeamInvitationDialog.tsx` | `withRouter`/`RouteComponentProps` → `useParams` hook |
| `components/DemoCreateAccountButton.tsx` | `withRouter`/`RouteComponentProps` → `useHistory` hook |
| `components/DemoCreateAccountPrimaryButton.tsx` | `withRouter`/`RouteComponentProps` → `useHistory` hook |
| `modules/userDashboard/components/UserProfileRoot.tsx` | `withRouter`/`RouteComponentProps` → `useParams` hook |

---

### PR 12 — Replace custom `useRouter` hook — batch 1 (components/) — DONE

**61 files changed, 133 insertions, 160 deletions | Risk: LOW**

Replaced the custom `useRouter` hook with standard React Router v5 hooks (`useHistory`, `useLocation`, `useParams`) in all 61 components/ files. This is pre-work that runs on v5.

**Breakdown by pattern:**

| Pattern | Files | Replacement |
|---|---|---|
| `{history}` only | 43 | `useHistory()` |
| `{location}` only | 4 | `useLocation()` |
| `{history, location}` | 3 | `useHistory()` + `useLocation()` |
| `{match}` (params access) | 11 | `useParams<T>()` |

---

### PR 13 — Replace custom `useRouter` hook — batch 2 + delete hook + remaining `RouteComponentProps` — DONE

**46 files changed, 109 insertions, 153 deletions | Risk: LOW**

Completed the `useRouter` replacement in all remaining files (modules/, hooks/, containers/, utils/), deleted the custom `useRouter` hook, and removed all `RouteComponentProps` usages from the codebase. This is pre-work that runs on v5.

**Breakdown:**

| Category | Files | Details |
|---|---|---|
| `{history}` only | 28 | modules/, hooks/, containers/ — `useHistory()` |
| `{match}` (params) | 5 | `useParams<T>()` |
| `{history, location}` | 2 | `useHistory()` + `useLocation()` |
| `{location}` only | 1 | `useLocation()` |
| `{history, match}` / `{location, match}` with `match.path`/`match.url` | 3 | `useRouteMatch()` + other hooks |
| `RouteComponentProps` removal | 6 | TeamInvitationRoot, InvitationLinkRoot, VerifyEmail, SetNewPassword, OrganizationRoot, UserDashMain |
| Hook deletion | 1 | `hooks/useRouter.ts` deleted |

---

### PR 14 — Convert navigation infrastructure from `history` object to `navigate` function — DONE

**~60 files changed, ~400 lines | Risk: MEDIUM**

Converted the entire mutation/subscription infrastructure from passing `RouterProps['history']` (an object with `.push()` and `.replace()` methods) to passing a `NavigateFn` (a simple function matching React Router v6's `useNavigate()` signature). This is the key pre-work that makes the v6 flip in PR 15 trivial for the infrastructure layer.

**Foundation changes:**

| File | Change |
|---|---|
| `types/relayMutations.ts` | Defined `NavigateFn` type. Renamed `HistoryLocalHandler` → `NavigateLocalHandler`, `HistoryMaybeLocalHandler` → `NavigateMaybeLocalHandler`, `OnNextHistoryContext` → `OnNextNavigateContext`. Updated `LocalHandlers` deprecated type. Removed `import type {RouterProps} from 'react-router'`. |
| `Atmosphere.ts` | Updated `SubscriptionRequestor` type and `registerQuery` method: `{history: RouterProps['history']}` → `{navigate: NavigateFn}`. Removed `RouterProps` import. |
| `subscriptions/subscriptionOnNext.ts` | Updated router parameter type. Removed `RouterProps` import. |
| `subscriptions/createSubscription.ts` | Updated router parameter type. Removed `RouterProps` import. |
| `hooks/useNavigate.ts` | **New file.** v5-compatible `useNavigate()` hook that wraps `useHistory()` and returns a `NavigateFn`. In PR 15, this file is deleted and imports switch to react-router v6's native `useNavigate`. |
| `hooks/useSubscription.ts` | Replaced `useHistory`/`useLocation` with `useNavigate`, passing `{navigate}` to subscription infrastructure. |
| `hooks/useAutoCheckIn.ts` | Same pattern as `useSubscription.ts`. |

**Mutation files updated (26 files):**

All mutations that accepted `history` now accept `navigate`. Usage converted: `history.push(x)` → `navigate(x)`, `history.replace(x)` → `navigate(x, {replace: true})`, `history.push(x, state)` → `navigate(x, {state})`.

Files: `AcceptTeamInvitationMutation`, `AddOrgMutation`, `AddTeamMutation`, `ArchiveOrganizationMutation`, `ArchiveTeamMutation`, `CreateTaskMutation`, `EmailPasswordResetMutation`, `EndCheckInMutation`, `EndRetrospectiveMutation`, `EndSprintPokerMutation`, `EndTeamPromptMutation`, `InviteToTeamMutation`, `LoginWithGoogleMutation`, `LoginWithMicrosoftMutation`, `LoginWithPasswordMutation`, `RemoveOrgUsersMutation`, `RemoveTeamMemberMutation`, `ResetPasswordMutation`, `SetOrgUserRoleMutation`, `SignUpWithPasswordMutation`, `StartCheckInMutation`, `StartRetrospectiveMutation`, `StartSprintPokerMutation`, `StartTeamPromptMutation`, `UpdateTaskMutation`, `VerifyEmailMutation`

**Toast handlers and other handlers (13 files):**

All toast handlers and notification handlers updated: `mapMentionedToToast`, `mapResponseRepliedToToast`, `mapRequestToJoinOrgToToast`, `mapDiscussionMentionedToToast`, `mapTeamsLimitReminderToToast`, `mapResponseMentionedToToast`, `mapPromptToJoinOrgToToast`, `popNotificationToast`, `popInvolvementToast`, `updateNotificationToast`, `handleAuthenticationRedirect`, `NotificationSubscription`, `PinnedSnackbarNotifications`

**Caller components updated (~20 files):**

Components that passed `history` to mutations now use `useNavigate()` and pass `navigate`. OAuth managers (`GoogleClientManager`, `MicrosoftClientManager`) updated parameter type from `RouterProps['history']` to `NavigateFn`.

---

### PR 15 — Upgrade to react-router v6 — convert ALL remaining v5 APIs – DONE

**~900 lines changed | Risk: HIGH**

The flip PR. With all indirect APIs eliminated by PRs 11-14, this PR converts all remaining standard v5 APIs to v6:
- `react-router`/`react-router-dom` packages → v6
- `Switch` → `Routes`
- `<Route component={X}>` / `<Route render={fn}>` → `<Route element={<X />}>`
- `<Redirect>` → `<Navigate>`
- `useHistory()` → `useNavigate()`
- `useRouteMatch()` → `useMatch()`
- Remove `exact` props (default in v6)
- Remove `@types/react-router`, `@types/react-router-dom` (types bundled in v6)

---

## Phase 4: Polish

### PR 16 — Migrate task card system from emotion to Tailwind CSS — DONE

**~500 lines changed | Risk: MEDIUM**

Migrated the entire task card component tree from emotion styled-components to Tailwind CSS. This eliminates the cascade conflict where `global.css` gives emotion higher priority than Tailwind (lines 3-6), removes ~25 styled-component definitions across 9 files, and makes cards fully responsive to their layout containers.

Also replaced `react-virtualized` in TeamArchive with `@tanstack/react-virtual` v3 row-based virtualization + Tailwind CSS grid, keeping only visible card rows in the DOM for performant scrolling through large archives.

**Key changes:**

| Category | Files | Change |
|---|---|---|
| Shadow utilities | `global.css` | Added `@utility shadow-card`, `shadow-card-hover`, `shadow-card-focus`, `shadow-card-dragging` |
| Core card | `OutcomeCard.tsx`, `OutcomeCardContainer.tsx` | Replaced `RootCard`, `ContentBlock`, `StatusIndicatorBlock`, `Wrapper` styled components with `cn()` + Tailwind |
| Card footer | `TaskFooter.tsx` | Replaced `Footer`, `ButtonGroup`, `ButtonSpacer`, `AvatarBlock` |
| User assignee | `TaskFooterUserAssignee.tsx` | Replaced `AvatarButton`, `Avatar`, `AvatarImage`, `AvatarLabel`, `TooltipToggle`, `StyledIcon` with plain `<button>` + Tailwind |
| Team assignee | `TaskFooterTeamAssignee.tsx` | Replaced `TooltipToggle`, `ToggleButtonText`, `TeamToggleButton` — kept `CardButton` for behavior |
| Card message | `OutcomeCardMessage.tsx` | Replaced `Message`, `Inner`, `MessageClose`, `MessageCloseIcon` |
| Null card | `NullCard.tsx` | Replaced `CardBlock`, `AddingHint` |
| Draggable wrapper | `DraggableTaskWrapper.tsx` | Replaced `DraggableStyles` |
| Poll card | `Poll.tsx` | Replaced `PollCard`, `BodyCol` |
| Team archive | `TeamArchive.tsx` | Replaced `react-virtualized` Grid + emotion with `@tanstack/react-virtual` v3 row virtualizer + Tailwind CSS grid |
| Column count hook | `useColumnCount.ts` | New hook: uses `ResizeObserver` to detect responsive column count for virtualizer row chunking |
| Deleted files | `cardRootStyles.ts`, `CreateCardRootStyles.ts` | Removed hardcoded `minWidth: 256` / `maxWidth: 300` that caused mobile overlap |
| Dependencies | `package.json` | Removed `react-virtualized`, `@types/react-virtualized`; added `@tanstack/react-virtual@^3` |

**Testing results:**
- `pnpm --filter parabol-client typecheck` — PASS
- No remaining references to `cardRootStyles` or `CreateCardRootStyles`
- Cards are now fully fluid (no hardcoded min/max width) — TeamArchive mobile overlap bug is fixed

---

### PR 17 — Add React.StrictMode wrapper — DONE

**~700 lines changed | Risk: MEDIUM**

Wrapped the app in `<React.StrictMode>` and replaced StrictMode-incompatible `react-swipeable-views`.

**Changes (actual):**

1. **New `SwipeablePanel` component** (`packages/client/components/SwipeablePanel.tsx`): Custom controlled horizontal slide panel using CSS `transform: translateX()` with transitions and touch event handling for swipe gestures. Supports `animateHeight` via `ResizeObserver`, `disabled` prop, and velocity-based swipe detection.

2. **Replaced `react-swipeable-views`** in 4 files:
   - `ReflectionWrapperMobile.tsx` — converted to `SwipeablePanel` + Tailwind classes
   - `EstimatePhaseArea.tsx` — converted to `SwipeablePanel` + Tailwind classes
   - `StageTimerModal.tsx` — converted to `SwipeablePanel` with `animateHeight` + Tailwind classes
   - `ScopePhaseArea.tsx` — converted to `SwipeablePanel` with `disabled` (no swipe, tab-bar only)

3. **Added `<StrictMode>` wrapper** in `Root.tsx`

4. **Updated `packages/client/package.json`**:
   - Removed: `react-swipeable-views`, `react-swipeable-views-core`, `react-swipeable-views-utils`, `@types/react-swipeable-views`

**Testing results:**
- `pnpm --filter parabol-client typecheck` — PASS
- `pnpm --filter parabol-client test` — PASS (18/18)

---

### PR 18 — Upgrade React Router v6 → v7 — DONE

**~250 lines changed | Risk: LOW-MEDIUM**

React Router v7 is architecturally the same as v6 when used in "declarative mode" (i.e., `<BrowserRouter>` with `<Routes>`/`<Route>` — which is what Parabol uses). The v6-to-v7 upgrade is designed to have **zero breaking changes** if you first enable v7 future flags in v6.x. The main work is enabling future flags, swapping the package, and rewriting imports.

**Background:**

React Router v7 consolidates `react-router` and `react-router-dom` into a single `react-router` package. It offers three modes:

1. **Declarative mode** (what Parabol uses): `<BrowserRouter>`, `<Routes>`, `<Route>`, hooks — identical to v6 with future flags enabled
2. **Data mode**: `createBrowserRouter` + `<RouterProvider>` with loaders/actions — not used by Parabol
3. **Framework mode**: Vite plugin, file-based routing, SSR — not applicable

Since Parabol uses declarative mode exclusively (no `createBrowserRouter`, no loaders, no actions), only 2 of the 6 future flags are relevant. The other 4 (`v7_fetcherPersist`, `v7_normalizeFormMethod`, `v7_partialHydration`, `v7_skipActionErrorRevalidation`) only apply to data routers.

**Peer dependency requirements:**
- React >= 18 (Parabol has 18.3.x)
- Node.js >= 20 (verify CI/production Node version)

**Step 1 — Enable future flags on `<BrowserRouter>` in `Root.tsx`:**

```tsx
// packages/client/Root.tsx
<Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
```

| Flag | Effect | Impact on Parabol |
|---|---|---|
| `v7_relativeSplatPath` | Changes how relative paths resolve inside splat routes (`path="*"`). Relative links from splat-matched routes now resolve relative to the splat portion, not the parent route. | **Audit required.** Parabol has 14 splat routes (`path='*'` or `path='/*'`). Any `<Link to="relative">` or `navigate('relative')` calls inside components rendered by these routes may need `../` prefixes. Most Parabol navigation uses absolute paths (starting with `/`), so impact is likely minimal. |
| `v7_startTransition` | Wraps router state updates in `React.startTransition()` instead of `React.useState`. This means route transitions are non-blocking and interruptible. | **Low impact.** Requires that any `React.lazy()` usage is at module scope (not inside components). Parabol already does this correctly — all lazy imports are top-level `const X = React.lazy(...)` declarations. |

**Splat routes to audit** (14 total):

| Route | File | Component rendered |
|---|---|---|
| `path='/*'` | `Action.tsx:103` | `PrivateRoutes` |
| `path='/retrospective-demo/*'` | `Action.tsx:76` | `DemoMeeting` |
| `path='*'` | `PrivateRoutes.tsx:69` | `DashboardOrNotFound` |
| `path='/activity-library/*'` | `PrivateRoutes.tsx:61` | `ActivityLibraryRoutes` |
| `path='/meet/:meetingId/*'` | `PrivateRoutes.tsx:63` | `MeetingRoot` |
| `path='/meeting-series/:meetingId/*'` | `PrivateRoutes.tsx:64` | `MeetingSeriesRoot` |
| `path='/me/*'` | `Dashboard.tsx:175` | `UserDashboard` |
| `path='/team/:teamId/*'` | `Dashboard.tsx:177` | `TeamRoot` |
| `path='*'` | `Dashboard.tsx:188` | `NotFound` |
| `path='*'` | `TeamContainer.tsx:70` | `TeamDashMain` |
| `path='*'` | `TeamDashMain.tsx:60` | `TeamDashActivityTab` |
| `path='organizations/:orgId/*'` | `UserDashboard.tsx:26` | `Organization` |
| `path='*'` | `UserDashboard.tsx:27` | `UserDashMain` |
| `path='*'` | `UserDashMain.tsx:25` | `MyDashboardTimelineRoot` |

For each splat route, verify that any relative `<Link to="...">` or `navigate('...')` calls within the rendered component tree still resolve to the intended path. Absolute paths (starting with `/`) are unaffected. If relative paths break, prefix them with `../` to restore v6 behavior.

**Step 2 — Verify future flags work correctly:**

Deploy with future flags on v6.30.0. Run full test suite and manual smoke tests. This is the safety net — if any splat route behavior changed, it will surface here while still on v6, making it easy to fix.

**Step 3 — Swap packages:**

```bash
# Remove react-router-dom (consolidated into react-router in v7)
pnpm --filter parabol-client remove react-router-dom

# Install react-router v7
pnpm --filter parabol-client add react-router@^7
```

Note: `react-router@7` has direct dependencies on `cookie@^1.0.1` and `set-cookie-parser@^2.6.0` — these will be installed automatically and are small, server-oriented utilities that don't affect client bundle size (tree-shaken out).

**Step 4 — Rewrite all imports (189 files):**

All imports from `'react-router-dom'` become `'react-router'`:

```bash
# Mechanical find-and-replace across 189 files:
find packages/client -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -exec sed -i '' "s|from 'react-router-dom'|from 'react-router'|g" {} +
```

Specific import changes:

| Before (v6) | After (v7) |
|---|---|
| `import { useNavigate } from 'react-router-dom'` | `import { useNavigate } from 'react-router'` |
| `import { BrowserRouter } from 'react-router-dom'` | `import { BrowserRouter } from 'react-router'` |
| `import { Link, Navigate } from 'react-router-dom'` | `import { Link, Navigate } from 'react-router'` |
| `import { Routes, Route } from 'react-router-dom'` | `import { Routes, Route } from 'react-router'` |
| `import { useParams, useLocation } from 'react-router-dom'` | `import { useParams, useLocation } from 'react-router'` |
| `import { useMatch, matchPath } from 'react-router-dom'` | `import { useMatch, matchPath } from 'react-router'` |
| `import type { NavigateFunction } from 'react-router-dom'` | `import type { NavigateFunction } from 'react-router'` |
| `import type { Location } from 'react-router-dom'` | `import type { Location } from 'react-router'` |

**Note on `react-router/dom` subpath:** In v7, DOM-specific APIs like `BrowserRouter`, `Link`, `NavLink`, `Form`, and `RouterProvider` can optionally be imported from `'react-router/dom'`. However, they are also re-exported from the main `'react-router'` entry point for backward compatibility. **Use `'react-router'` for all imports** — the subpath import is only required in framework mode or when using `HydratedRouter`.

**Step 5 — Remove future flags:**

After the v7 package is installed, the `future` prop on `<BrowserRouter>` is no longer needed (the flags are now default behavior):

```tsx
// packages/client/Root.tsx — before
<Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>

// packages/client/Root.tsx — after
<Router>
```

**Step 6 — Update custom type aliases:**

Two files reference `NavigateFunction` from `react-router-dom`:

| File | Change |
|---|---|
| `types/relayMutations.ts` | `import type {NavigateFunction} from 'react-router-dom'` → `import type {NavigateFunction} from 'react-router'` |
| `hooks/usePageProvider.ts` | `import {type NavigateFunction, useNavigate} from 'react-router-dom'` → `import {type NavigateFunction, useNavigate} from 'react-router'` |

These are handled by the bulk sed in Step 4, but call them out for verification since they're type-level imports used by the mutation/subscription infrastructure.

**Step 7 — Verify no remaining `react-router-dom` references:**

```bash
# Should return zero results:
grep -r "react-router-dom" packages/client/
grep -r "react-router-dom" packages/types/
```

**What does NOT change:**

- All v6 component APIs (`Routes`, `Route`, `Link`, `NavLink`, `Navigate`, `Outlet`) — identical in v7
- All v6 hooks (`useNavigate`, `useLocation`, `useParams`, `useSearchParams`, `useMatch`) — identical in v7
- `matchPath` utility — identical in v7
- Route nesting patterns — identical in v7
- Lazy route loading with `React.lazy` + `Suspense` — identical in v7
- The `NavigateFn` type alias in `relayMutations.ts` — still wraps `NavigateFunction`, which exists in v7

**What is newly available (optional, not required for this PR):**

- Data router pattern (`createBrowserRouter` + `RouterProvider` + loaders/actions) — available if Parabol wants to adopt it later
- Type-safe route params via framework mode — not applicable in declarative mode
- React Server Components integration — not applicable to Parabol's architecture
- Pre-rendering support — framework mode only

**Testing:**

- [ ] `pnpm --filter parabol-client typecheck` — verify no TypeScript errors
- [ ] `pnpm --filter parabol-client test` — all Jest tests pass
- [ ] `pnpm build` — production build succeeds
- [ ] Playwright E2E tests pass
- [ ] Manual smoke test: navigate between all major sections (dashboard, meetings, team settings, activity library, user profile, org settings)
- [ ] Manual smoke test: verify deep links work (direct URL entry to `/meet/:id`, `/team/:id/settings`, `/activity-library/details/:id`)
- [ ] Manual smoke test: verify back/forward browser navigation
- [ ] Manual smoke test: verify modal routes with background location (`ReviewRequestToJoinOrg`, etc.)
- [ ] Verify no console warnings about deprecated APIs

---

### PR 19 — Mattermost plugin React 18 upgrade — DONE

**~20 lines changed | Risk: LOW**

The Mattermost plugin is an independent package with its own webpack config and React dependencies. React was externalized via webpack (the host Mattermost webapp provides React at runtime), so the plugin's `package.json` React version only affects development and type checking.

**Changes (actual):**

1. **`packages/mattermost-plugin/package.json`**: React 18 deps were already set in PR 7. Removed stale `enzyme-adapter-utils` override (no enzyme usage in plugin).

2. **`packages/mattermost-plugin/webpack.config.js`** and **`prod.webpack.config.js`**: Set `@babel/preset-react` to `runtime: 'automatic'` for correctness. The second babel rule (with `@babel/preset-react` + `@babel/preset-typescript`) processes files after sucrase already handles JSX, making it effectively a no-op, but the runtime should be set correctly for forward-compatibility.

3. **`packages/mattermost-plugin/types/mattermost-webapp/index.d.ts`**: Fixed typo `Reast.ReactNode` → `React.ReactNode` in `registerChannelHeaderButtonAction` type.

**Audit findings (no changes needed):**

- All 37+ React files are functional components with hooks — no class components, no deprecated APIs
- All `useEffect` calls have proper cleanup or are state-initialization patterns safe under StrictMode
- `styled-components` v5 (2 files) and `react-bootstrap` (2 files, externalized) are React 18 compatible
- Webpack externals config verified: `react`, `react-dom`, `redux`, `react-redux`, `prop-types`, `react-bootstrap`, `react-router-dom` all correctly mapped to Mattermost host globals

**Testing results:**
- `pnpm --filter parabol-mattermost-plugin typecheck` — PASS
- `pnpm --filter parabol-mattermost-plugin build` — PASS (webpack 5, 12s)

---

## Estimated Scope

| PR | Phase | Description | Est. Lines | Risk | Status |
|---|---|---|---|---|---|
| 1 | Pre-work | `react-beautiful-dnd` → `@hello-pangea/dnd` v16 | ~30 | LOW | **DONE** |
| 2 | Pre-work | Fix `React.FC` types, explicit `children` | ~50 | LOW | **DONE** |
| 3 | Pre-work | Convert class components (batch 1: simple) | ~400 | LOW | **DONE** |
| 4 | Pre-work | Convert class components (batch 2: complex) | ~500 | MEDIUM | **DONE** |
| 5 | Pre-work | Fix `useEffect` cleanup / StrictMode safety | ~300 | MEDIUM | **DONE** |
| 6 | Pre-work | Update minor dependencies | ~30 | LOW | **DONE** |
| 7 | Version Bump | React 17 → 18 + fix compilation | ~120 | **HIGH** | **DONE** |
| 8 | Version Bump | Bump `@hello-pangea/dnd` v16 → v18 | ~10 | LOW | **DONE** |
| 9 | Version Bump | `ReactDOM.render` → `createRoot` | ~15 | LOW | **DONE** |
| 10 | Version Bump | Verify email SSR | ~60 | LOW | **DONE** |
| 11 | Router Pre-work | Remove `withRouter` HOC → use hooks directly | ~250 | LOW | **DONE** |
| 12 | Router Pre-work | Replace custom `useRouter` hook — batch 1 (components/) | ~300 | LOW | **DONE** |
| 13 | Router Pre-work | Replace custom `useRouter` hook — batch 2 + delete hook + remaining `RouteComponentProps` | ~260 | LOW | **DONE** |
| 14 | Router Pre-work | Convert navigation infrastructure from `history` object to `navigate` function | ~400 | MEDIUM | **DONE** |
| 15 | Router Flip | Upgrade to react-router v6 — convert ALL remaining v5 APIs | ~900 | **HIGH** | **DONE** |
| 16 | Polish | Migrate task card system from emotion to Tailwind CSS | ~500 | MEDIUM | **DONE** |
| 17 | Polish | Add `React.StrictMode` wrapper | ~700 | MEDIUM | **DONE** |
| 18 | Router v7 | Upgrade React Router v6 → v7 | ~250 | LOW-MEDIUM | **DONE** |
| 19 | Polish | Mattermost plugin upgrade | ~20 | LOW | **DONE** |

**Total: ~4,950-5,250 lines across 19 PRs**

---

## Dependencies and Ordering

```
PR 1 ─┐
PR 2 ─┤
PR 3 ─┼─ (all independent, can be done in parallel)
PR 5 ─┤
PR 6 ─┘
       │
PR 4 ─── (depends on PR 3 being merged, since batch 2 is more complex)
       │
       ▼
PR 7 ─── React version bump (depends on ALL Phase 1 PRs)
       │
       ├─ PR 8  (@hello-pangea/dnd v16 → v18 — depends on PR 7)
       ├─ PR 9  (createRoot — depends on PR 7)
       └─ PR 10 (email SSR — depends on PR 7)
            │
            ▼
       PR 11 ── Remove withRouter HOC (pre-work, runs on v5)
            │
            ├─ PR 12 (replace useRouter batch 1 — depends on PR 11)
            │    │
            │    └─ PR 13 (replace useRouter batch 2 + delete hook — depends on PR 12)
            │         │
            │         └─ PR 14 (convert navigation infrastructure — depends on PR 13)
            │              │
            │              └─ PR 15 (v6 flip — depends on PR 14)
            │
            PR 16 ── Task card emotion → Tailwind (depends on PR 15)
            PR 17 ── StrictMode (depends on PR 16)
            PR 18 ── React Router v7 upgrade (depends on PR 17)
            PR 19 ── Mattermost plugin (independent, can be done anytime after PR 7)
```

---

## Rollback Strategy

- **Phase 1 PRs** are independently revertible since they work on React 17.
- **PR 7 (version bump)** is the point of no return. If issues arise, revert PR 7+8+9+10 together to return to React 17.
- **Phase 3 (Router)** should not be started until Phase 2 is stable in production. If router issues arise, revert the specific PR — each nested route tree conversion is somewhat independent.
- **PR 16 (emotion → Tailwind)** can be reverted independently — it only changes styling implementation, not behavior.
- **PR 17 (StrictMode)** can be reverted trivially since it's a single wrapper component.
- **PR 18 (Router v7)** can be reverted by reinstalling `react-router-dom@^6.30.0` and reverting the import changes. The future flags step (Step 1-2) can be deployed independently on v6 as a safety gate before the package swap.

## Testing Checklist

Each PR should verify:
- [ ] `pnpm tsc --noEmit` passes (TypeScript compilation)
- [ ] `pnpm test` passes (Jest unit tests)
- [ ] `pnpm build` succeeds (production build)
- [ ] Playwright E2E tests pass
- [ ] Manual smoke test of affected features

For Phase 2 (version bump), also verify:
- [ ] All email templates render correctly
- [ ] WebSocket connections establish and maintain
- [ ] Relay subscriptions fire correctly
- [ ] Service worker registration works
- [ ] Hot module replacement works in dev mode
