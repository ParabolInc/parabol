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

108 files use React Router v5 APIs. The migration is broken into 6 PRs organized by API pattern.

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

---

### PR 11 — Upgrade `react-router-dom` to v6, convert core route definitions

**~500 lines changed | Risk: HIGH**

This is the atomic router switch. All top-level route definitions must be converted together.

**Changes:**

1. Update `package.json`:
   - `react-router` → `^6.x`
   - `react-router-dom` → `^6.x`
   - Remove `@types/react-router`, `@types/react-router-dom` (types are bundled in v6)

2. Convert `Root.tsx`:
   - Update `BrowserRouter` import path (same API, different internals)

3. Convert `components/Action/Action.tsx`:
   - `Switch` → `Routes`
   - All `<Route exact path="/" render={(p) => <X {...p} />} />` → `<Route path="/" element={<X />} />`
   - All `<Route path="/x" component={X} />` → `<Route path="/x" element={<X />} />`
   - `<Redirect to="/x" />` → `<Navigate to="/x" replace />`
   - Remove all `exact` props (v6 routes are exact by default; use trailing `/*` for prefix matching)

4. Convert `components/PrivateRoutes.tsx`:
   - Same `Switch` → `Routes` conversion
   - Update `backgroundLocation` pattern for v6 `location` prop on `<Routes>`
   - `<Redirect>` → `<Navigate>`
   - Routes that had `component` prop → `element` prop

**Testing:** Every route in the app must be reachable. Test:
- Sign in / create account flows
- Dashboard navigation
- Meeting entry and phase navigation
- Admin routes
- Invitation flows
- 404 handling

---

### PR 12 — Convert nested route trees

**~400 lines changed | Risk: MEDIUM**

Convert all nested `Switch` components to `Routes` in secondary routing files.

**Files:**
| File | Routes defined |
|---|---|
| `components/Dashboard.tsx` | `/meetings`, `/me`, `/team/:teamId`, `/pages`, `/pages/:pageSlug`, etc. |
| `modules/userDashboard/components/UserDashboard/UserDashboard.tsx` | `/me/profile`, `/me/organizations`, `/me/organizations/:orgId` |
| `modules/teamDashboard/containers/Team/TeamContainer.tsx` | `/team/:teamId/settings`, `/team/:teamId/archive` |
| `modules/userDashboard/components/OrgBilling/Organization.tsx` | Billing sub-routes |
| `modules/userDashboard/components/UserDashMain.tsx` | User dashboard sub-routes |
| `modules/teamDashboard/components/TeamDashMain/TeamDashMain.tsx` | Team dashboard sub-routes |
| `components/ActivityLibrary/ActivityLibraryRoutes.tsx` | Activity library sub-routes |

**Pattern:** Each file follows the same mechanical conversion:
```tsx
// Before (v5)
<Switch>
  <Route exact path="/me/profile" component={UserProfileRoot} />
  <Route path="/me/organizations/:orgId" component={OrganizationRoot} />
</Switch>

// After (v6)
<Routes>
  <Route path="/me/profile" element={<UserProfileRoot />} />
  <Route path="/me/organizations/:orgId" element={<OrganizationRoot />} />
</Routes>
```

Note: Parent routes that contain nested `<Routes>` must use `/*` suffix in their path (e.g., `path="/me/*"`).

---

### PR 13 — Replace `useRouter` custom hook + migrate `useHistory` batch 1

**~500 lines changed | Risk: MEDIUM**

The custom `useRouter` hook (`packages/client/hooks/useRouter.ts`) directly accesses React Router v5's `__RouterContext`, which doesn't exist in v6. Replace it with v6 hooks and migrate the first batch of `useHistory` usages.

**Changes:**

1. Rewrite `hooks/useRouter.ts` to provide a compatibility shim using v6 hooks:
   ```tsx
   // New implementation using v6 APIs
   import {useNavigate, useLocation, useParams} from 'react-router-dom'

   const useRouter = <T extends Record<string, string> = Record<string, string>>() => {
     const navigate = useNavigate()
     const location = useLocation()
     const params = useParams<T>()
     return {navigate, location, params}
   }
   ```
   - Audit all call sites that use `useRouter()` for `.history`, `.match`, `.location` and update to new return shape

2. Migrate first 12 files from `useHistory()` → `useNavigate()`:
   ```tsx
   // Before
   const history = useHistory()
   history.push('/path')
   history.replace('/path')

   // After
   const navigate = useNavigate()
   navigate('/path')
   navigate('/path', {replace: true})
   ```

**Files (batch 1):**
```
hooks/useRouter.ts (rewrite)
modules/search/useSearchListNavigation.ts
modules/pages/RequestPageAccess.tsx
components/DashNavList/LeftNavPrivatePagesSection.tsx
components/DashNavList/LeftNavTeamLink.tsx
components/DashNavList/PageActions.tsx
modules/userDashboard/components/OrgIntegrations/OrgIntegrations.tsx
modules/pages/PageNoAccess.tsx
modules/pages/ArchivedPages.tsx
modules/pages/PageDeletedHeader.tsx
components/DashNavList/LeftNavTeamsSection.tsx
modules/userDashboard/components/Organization/OrgNav.tsx
```

---

### PR 14 — Migrate `useHistory` batch 2 + `useRouteMatch`

**~400 lines changed | Risk: MEDIUM**

Complete the `useHistory` → `useNavigate` migration and convert `useRouteMatch` → `useMatch`.

**`useHistory` batch 2 (11 files):**
```
modules/userDashboard/components/OrgTeams/TeaserOrgTeamsRow.tsx
modules/pages/PageHeaderPublic.tsx
modules/meeting/components/CustomTemplateUpgradeMsg.tsx
components/TeamPromptMeeting.tsx
components/ShareTopicRouterRoot.tsx
components/ReviewRequestToJoinOrgRoot.tsx
components/ActivityLibrary/CreateNewActivity/CreateNewActivity.tsx
components/ActivityLibrary/TeamPickerModal.tsx
components/ActivityLibrary/ActivityDetails/TemplateDetails.tsx
components/ActivityLibrary/ActivityDetailsSidebar.tsx
components/NewMeetingSidebarUpgradeBlock.tsx
```

**`useRouteMatch` → `useMatch` (7 files):**
```tsx
// Before
const match = useRouteMatch('/team/:teamId')
match?.params.teamId

// After
const match = useMatch('/team/:teamId')
match?.params.teamId
```

**Files:**
```
components/Dashboard/DashSidebar.tsx
components/Dashboard/LeftDashNavItem.tsx
components/DashNavList/LeftNavTeamLink.tsx (may already be updated in PR 12)
modules/userDashboard/components/OrgBilling/Organization.tsx
components/Dashboard/MobileDashSidebar.tsx
components/RequestToJoin.tsx
components/ActivityLibrary/ActivityLibraryRoutes.tsx
```

---

### PR 15 — Remove `withRouter` HOC usage

**~500 lines changed | Risk: MEDIUM**

`withRouter` is removed in React Router v6. Convert all 9 wrapped components to use hooks directly.

**Files and approach:**
| File | Current pattern | Conversion |
|---|---|---|
| `components/DemoCreateAccountButton.tsx` | `withRouter` wraps component | Use `useNavigate()` inline |
| `components/DemoCreateAccountPrimaryButton.tsx` | `withRouter` wraps component | Use `useNavigate()` inline |
| `components/SuggestedActionTryRetroMeeting.tsx` | `withRouter` for `history.push` | Use `useNavigate()` inline |
| `components/SuggestedActionTryActionMeeting.tsx` | `withRouter` for `history.push` | Use `useNavigate()` inline |
| `components/SuggestedActionTryTheDemo.tsx` | `withRouter` for `history.push` | Use `useNavigate()` inline |
| `components/SuggestedActionCreateNewTeam.tsx` | `withRouter` for `history.push` | Use `useNavigate()` inline |
| `components/DashboardRoot.tsx` | `withRouter` for location/history | Use `useLocation()` + `useNavigate()` |
| `components/TeamInvitationDialog.tsx` | `withRouter` for history | Use `useNavigate()` |
| `modules/userDashboard/components/UserProfileRoot.tsx` | `withRouter` for history | Use `useNavigate()` |

**Pattern:**
```tsx
// Before
import {withRouter, RouteComponentProps} from 'react-router-dom'
const MyComponent = ({history}: RouteComponentProps) => {
  return <button onClick={() => history.push('/path')}>Go</button>
}
export default withRouter(MyComponent)

// After
import {useNavigate} from 'react-router-dom'
const MyComponent = () => {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/path')}>Go</button>
}
export default MyComponent
```

---

### PR 16 — Update `Link`/`NavLink` patterns + final router cleanup

**~300 lines changed | Risk: LOW**

Clean up remaining React Router v5 patterns and update Link/NavLink components.

**Changes:**

1. **Link/NavLink updates** (~36 files):
   - v6 `NavLink` changes `activeClassName`/`activeStyle` to a render function:
     ```tsx
     // Before (v5)
     <NavLink to="/path" activeClassName="active">

     // After (v6)
     <NavLink to="/path" className={({isActive}) => isActive ? 'active' : ''}>
     ```
   - Audit `components/StyledLink.tsx` and update

2. **Remove v5 type packages**:
   - Remove `@types/react-router` from `devDependencies`
   - Remove `@types/react-router-dom` from `devDependencies`

3. **Update utility files**:
   - `utils/getMeetingPathParams.ts`
   - `utils/getTeamIdFromPathname.ts`
   - `utils/onMeetingRoute.ts`
   - `utils/onExOrgRoute.ts`
   - `utils/onTeamRoute.ts`
   - `subscriptions/createSubscription.ts`
   - `subscriptions/subscriptionOnNext.ts`
   - `mutations/toasts/popInvolvementToast.ts`
   - `mutations/InviteToTeamMutation.ts`
   - `mutations/StartDraggingReflectionMutation.ts`
   - `types/relayMutations.ts`

4. **Update non-component files** that import `History` or `RouteComponentProps` types:
   - `Atmosphere.ts`
   - Various mutation files that accept `history` as a parameter

---

## Phase 4: Polish

### PR 17 — Add `React.StrictMode` wrapper

**~50-200 lines changed | Risk: MEDIUM**

Wrap the app in `<React.StrictMode>` to surface bugs from unsafe patterns. StrictMode double-invokes effects and renders in development only.

**File:** `packages/client/Root.tsx`
```tsx
import {StrictMode} from 'react'

export default function Root() {
  return (
    <StrictMode>
      <AtmosphereProvider>
        {/* ... existing tree ... */}
      </AtmosphereProvider>
    </StrictMode>
  )
}
```

**Expected issues to fix:**
- Any remaining `useEffect` without proper cleanup
- Any remaining ref mutations in render paths
- Subscription handlers that don't handle double-fire
- Third-party libraries that don't support StrictMode:
  - **`react-swipeable-views`** (custom fork): deprecated upstream, uses `UNSAFE_componentWillReceiveProps`. Replace with CSS `scroll-snap` or `react-swipeable-views-react-18-fix`. 4 consuming files: `ReflectionWrapperMobile.tsx`, `EstimatePhaseArea.tsx`, `StageTimerModal.tsx`, `ScopePhaseArea.tsx`
  - **`react-virtualized`**: emits `findDOMNode` deprecation warnings in StrictMode. Replace with `@tanstack/react-virtual` — only 1 consuming file (`TeamArchive.tsx`)

---

### PR 18 — Mattermost plugin React 18 upgrade

**~300 lines changed | Risk: LOW**

The Mattermost plugin is an independent package with its own webpack config and React dependencies. It can be upgraded separately.

**Changes:**
- `packages/mattermost-plugin/package.json`: update `react`, `react-dom` to `^18.2.0`
- Update overrides/resolutions
- Fix any TypeScript compilation errors
- `packages/mattermost-plugin/webpack.config.js`: verify externals config
- 37 React files, 2.7K LOC — mostly MUI + Redux components

**Testing:** Build the Mattermost plugin and test in a Mattermost instance.

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
| 11 | Router | Upgrade to v6, core route definitions | ~500 | **HIGH** | |
| 12 | Router | Nested route trees | ~400 | MEDIUM | |
| 13 | Router | Replace `useRouter` + `useHistory` batch 1 | ~500 | MEDIUM | |
| 14 | Router | `useHistory` batch 2 + `useRouteMatch` | ~400 | MEDIUM | |
| 15 | Router | Remove `withRouter` HOC | ~500 | MEDIUM | |
| 16 | Router | `Link`/`NavLink` + cleanup | ~300 | LOW | |
| 17 | Polish | Add `React.StrictMode` | ~50-200 | MEDIUM | |
| 18 | Polish | Mattermost plugin upgrade | ~300 | LOW | |

**Total: ~4,500-5,000 lines across 18 PRs**

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
       PR 11 ── Router v6 upgrade (depends on PR 7)
            │
            ├─ PR 12 (nested routes — depends on PR 11)
            ├─ PR 13 (useRouter + useHistory batch 1 — depends on PR 11)
            │    │
            │    └─ PR 14 (useHistory batch 2 — depends on PR 13)
            │
            ├─ PR 15 (withRouter removal — depends on PR 11)
            └─ PR 16 (Link/NavLink + cleanup — depends on PR 12-15)
                  │
                  ▼
             PR 17 ── StrictMode (depends on all Router PRs)
             PR 18 ── Mattermost plugin (independent, can be done anytime after PR 7)
```

---

## Rollback Strategy

- **Phase 1 PRs** are independently revertible since they work on React 17.
- **PR 7 (version bump)** is the point of no return. If issues arise, revert PR 7+8+9+10 together to return to React 17.
- **Phase 3 (Router)** should not be started until Phase 2 is stable in production. If router issues arise, revert the specific PR — each nested route tree conversion is somewhat independent.
- **PR 17 (StrictMode)** can be reverted trivially since it's a single wrapper component.

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
