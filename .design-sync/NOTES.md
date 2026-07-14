# Parabol design-sync notes

Parabol's design system is **app-internal** (packages/client is an app, not a published library). This sync uses a bespoke synth-entry setup. Read this before any re-sync.

## Scope
- **Presentational tier** (this sync): `packages/client/ui` primitives + `[pure]` (non-Relay) feature components across Team Dashboard, Retrospective, Estimate/Poker, Team Prompt/Standup, Org Admin. Curated in `.design-sync/manifest.json`.
- **Iconic [relay] tier**: ~15-20 signature Relay-coupled components (PokerCard, ReflectionCard, TeamPromptResponseCard, DashboardAvatars, OrgPlan) — handled separately via a mock-Relay harness (see Re-sync risks). Not all may render.
- `.design-sync/manifest.json` drives everything: `gen.mjs` reads it, auto-skips Relay files (RELAY_RX), emits the barrel + componentSrcMap + docsMap (group stubs in `.design-sync/groups/`).

## Regenerate + build (the exact commands)
```
node .ds-sync/gen.mjs . .design-sync/manifest.json          # regenerate barrel + config from manifest
node .design-sync/build-css.mjs . packages/client/.ds-tailwind.css   # compile Tailwind v4 -> static CSS
node .design-sync/dsbuild.mjs --config .design-sync/config.json \
  --node-modules packages/client/node_modules \
  --entry packages/client/.ds-entry.tsx --out ./ds-bundle    # dsbuild wraps package-build + host shim
node .ds-sync/package-validate.mjs ./ds-bundle
```
- **Always build via `.design-sync/dsbuild.mjs`, never package-build.mjs directly** — dsbuild injects the host-environment shim (below). A bare package-build leaves the bundle throwing on load.
- The generator lives at `.ds-sync/gen.mjs` (needs ts-morph from `.ds-sync/node_modules`) — a copy is kept at `.design-sync/gen.mjs`. Edit the `.ds-sync` one.

## The four things that make this repo build (all non-obvious)
1. **Tailwind v4, compiled not copied.** Styling source is `packages/client/styles/theme/global.css` (v4 `@theme` with paletteV3 colors + IBM Plex). It has `@import 'tailwindcss/utilities.css'` + `@apply`, so it must be COMPILED (`build-css.mjs` via `@tailwindcss/postcss`) into `packages/client/.ds-tailwind.css`, which `cfg.cssEntry` points at. `@font-face` blocks are stripped (their `/static/fonts/` urls don't resolve under the package); fonts ship via `cfg.extraFonts` → `.design-sync/fonts.css` → repo `static/fonts/`.
2. **React symlink.** `vendorReact` needs react + react-dom under `--node-modules`. The client package has react-dom but NOT react (pnpm keeps react only at repo root). Fix: `ln -sfn <repo>/node_modules/.pnpm/react@18.3.1/node_modules/react packages/client/node_modules/react` (gitignored; recreate on fresh clone).
3. **Relay macro stub.** Every component imports `graphql` from `babel-plugin-relay/macro` (a build-time webpack transform esbuild can't run). `cfg.tsconfig` → `.design-sync/tsconfig.ds.json` aliases the macro to `.design-sync/shims/graphql-macro.ts`, a stub returning a structurally-valid-enough relay node (right `kind` + `params.name`). A no-op stub is NOT enough: mutations/subscriptions call `getRequest(graphql`…`)` at MODULE scope and relay throws "Expected a request" on a bad node, aborting the whole IIFE.
4. **Host-environment shim.** Parabol modules read `window.__ACTION__` (server-injected config) at module scope. `dsbuild.mjs` prepends `window.__ACTION__={}` after the bundle header so those reads return undefined (app code falsy-guards) instead of throwing.

## Path-resolution gotchas
- `cfgPath` resolves ALL cfg path fields relative to **PKG_DIR (packages/client)**, using the `root` arg only as the containment bound. So repo-root files are addressed package-relative: `extraFonts: "../../.design-sync/fonts.css"`, `tsconfig: "../../.design-sync/tsconfig.ds.json"`. `cssEntry` is bounded to PKG_DIR so it must live UNDER packages/client (`.ds-tailwind.css`).
- PKG_DIR resolves by walking up from `--entry` to the nearest named package.json → the barrel at `packages/client/.ds-entry.tsx` makes PKG_DIR = packages/client.
- Groups come from `docsMap` frontmatter stubs (`.design-sync/groups/<slug>.md`, `category:`), NOT path derivation. A frontmatter-only stub sets the group without clobbering the synthesized `.prompt.md`.

## Loader gaps
- The converter's esbuild only loads .svg/.png/.woff/.woff2 (no hook to extend). Components importing `.jpeg/.jpg/.gif` break the build. `OrgBillingReassuranceQuote` (imports adam.jpeg/cliff.jpeg) is excluded in manifest for this reason. Add more names to `manifest.exclude` if new image-importing components break a build.

## Known render warns / triage
- `AlertDialogContent` alone errors "DialogPortal must be used within Dialog" — a compound sub-part; author its preview as a full AlertDialog composition.
- Blank floor cards (Button, Avatar, layout wrappers) are components whose bare render is empty — they need authored previews, not bugs.

## Noise to prune (secondary exports pulled from dirs)
Candidates that are styled-helpers / not real DS components: `IconGroupBlock`, `MeetingTopBarStyles` (from MeetingTopBar), `Author` (ReflectionCardAuthor's default), `NextMeetingCountdown`/`NextMeetingLink` (TeamPromptEndedBadge secondaries), `ReflectionCardRoot`. Add to `manifest.exclude` as identified.

## Preview-authoring harness facts (folded from wave learnings)
- **Providers must be IN-BUNDLE.** The bundle privately bundles every dep except react/react-dom/react-is, so a provider `import`ed into a preview is a different module copy with its own context and does nothing. Fixed globally via `cfg.provider` → `DesignSyncProvider` (`.design-sync/shims/ds-provider.tsx`, added via `extraEntries`) which supplies MemoryRouter + Radix Tooltip.Provider + a minimal RelayEnvironmentProvider (useAtmosphere == useRelayEnvironment, so this satisfies atmosphere reads too). This rescued ~28 router/tooltip/atmosphere components.
- **motion/react animations are frozen by the capture clock.** `package-capture.mjs`/`package-validate.mjs` call `page.clock.setFixedTime`, freezing rAF, so motion enter-animations (`initial opacity:0`) stay blank (the whole Dialog family). Fixed by adding `reducedMotion:'reduce'` to `newPage` in BOTH `.ds-sync/package-capture.mjs` (~line 101) and `.ds-sync/package-validate.mjs` (~line 441). **These are staged-script edits — re-apply after any `cp -r` re-copy of `.ds-sync/`.**
- **Preview-only Tailwind classes** are emitted because `build-css.mjs` now `@source`s `.design-sync/previews` + `.design-sync/shims`. Still: `!important` variants and truly novel arbitrary classes may no-op; `bg-background`/`bg-muted` are NOT defined tokens (use paletteV3 `bg-white`/`bg-slate-*`).
- **Portal/overlay components** (Dialog/Menu/Select families, sidebars, TeamPromptEditablePromptModal) escape the product grid card → `cfg.overrides.<Name> = {cardMode:'single'}` (wide cards → `column`). Already applied in config from the validate `[GRID_OVERFLOW]` suggestions.
- **Grading viewport is 900×700** (capture) — components gated behind `min-[1280px]` render blank at grading size. `PhaseHeaderDescription` is `display:none` below 1280px → benign blank (known render warn).
- Changing `cfg.provider`/overrides is preview-affecting → clears grades; re-grade after such changes.

## Iconic [relay] tier — BUILT (Signature group)
The react-relay read-hook identity stub (`.design-sync/shims/react-relay.ts`, aliased via tsconfig) works: it re-exports the REAL react-relay via the `react-relay/index.js` subpath (the exact-match alias doesn't catch it) and overrides useFragment/usePreloadedQuery/useLazyLoadQuery/usePaginationFragment/useRefetchableFragment to pass-through. Signature components render from a plain data object passed as the "ref" prop, e.g. `<DashboardAvatars team={{teamMembers:[{user:{picture,preferredName,isConnected}}]}}/>`. Manifest "Signature" group has `includeRelay:true`.
- **12 of 14 render good**: DashboardAvatars/Avatar, OrgPlan, ColorBadge, ReflectionGroupVoting, PokerVotingRow, PokerActiveVoting, EstimateDimensionColumn, PokerCard, PokerCardDeck, TeamPromptResponseEmojis, ReflectionCard (TipTap renders from a stringified `{type:'doc',…}` content with isViewerCreator:false + phaseType:'discuss').
- **2 floor-carded** (in manifest.exclude): **ReflectionGroup** (its DraggableReflectionCard uses `useLazyLoadQuery`/useSpotlightResults against the empty store → viewer undefined), **TeamPromptResponseCard** (PromptResponseEditor + react-copy-to-clipboard + motion layout throw → error boundary blank).
- Signature preview recipes: reactji ids must be `reactableId:emojiName` with a valid emoji-mart shortcode (tada/heart/fire/rocket); AvatarList users need `{id,picture,preferredName}` + `isInitialStageRender:true`; PokerCard geometry zeroed in a `relative` 125×175 box. Screenshot group prefix follows docsMap (e.g. `orgbilling__OrgPlan.png`).

## Re-sync risks (watch-list)
- The relay macro stub + host shim are tied to Parabol's current internals. If Parabol changes how `window.__ACTION__` is read, or adds module-load relay calls with shapes the stub doesn't satisfy, the bundle can throw on load again — re-run one card through `.ds-sync/trace.mjs <html>` to get the stack.
- `.ds-tailwind.css` is a build artifact of `global.css` — regenerate with build-css.mjs whenever styling changes.
- The iconic [relay] tier (if built) depends on a mock-Relay harness that is inherently fragile; some components may only ever be floor cards.
- React/radix versions pinned at build: react 18.3.1, Tailwind 4.3.0, playwright 1.56.0.
