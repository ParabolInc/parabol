---
name: client-components
description: Conventions and known pitfalls for React client components — Tailwind (no preflight), ui/ primitives (Dialog, Select, Menu, Tooltip), buttons, dates, phone layouts, HTML sanitization and component design. Use when building or reviewing UI components in packages/client.
---

# packages/client conventions

## Styling

- **All new components use Tailwind CSS**, not emotion (`styled`, `css` from `@emotion/styled` / `@emotion/react`).
- Merge classes with `cn()` from `ui/cn`, never `twMerge()` directly. `cn` wraps `clsx` + `twMerge`; replace any `twMerge(...)` you touch.
- Biome enforces Tailwind class order (`lint/nursery/useSortedClasses`). Fix with `pnpm exec biome check --write <file>`, not `pnpm biome check --write` (the `biome` script already includes `check`).
- **Promote shared classes to the parent.** Inherited properties (`font-*`, `text-*`, `leading-*`, color) cascade; structural ones (`flex`, `w-*`, `p-*`) stay where they act.
- **There is no Tailwind preflight.** `styles/theme/global.css` imports only Tailwind's theme and utilities, so `h1`–`h3` and `p` keep browser margins, `ul` keeps its indent and bullets, and `th` stays bold and centered. Add `m-0` to headings and paragraphs and `m-0 list-none p-0` to lists, as existing components do. When one shows up, sweep the whole change for the rest.
- **`@container` breaks `grid-rows-subgrid` on the same element.** Container queries apply layout containment, and a contained element can't be a subgrid, so its rows silently stop aligning with its siblings. Put `@container` on a child, or name an ancestor container (`@container/plans` + `@2xl/plans:`). Verify by measuring each sibling's row tops, not by eye.
- **Phone-only fixes must keep desktop pixel-identical.** Prefer mobile-first utilities that change intrinsic sizes only below the breakpoint. To let a long word break only on phones, use `wrap-anywhere md:wrap-normal`; `min-w-0` + `wrap-break-word` also shrinks the text at `md` and moves desktop pixels.
- **Mobile text inputs:** keep editable text at 16px (`text-base`) or larger below the mobile breakpoint, or iOS Safari zooms the page on focus. Don't dock custom toolbars to the on-screen keyboard (fixed + `visualViewport` inset): Safari floats its own accessory controls over that spot. Don't add formatting toolbars to mobile text fields; use the existing selection bubble menu, placed below the selection. Playwright emulation shows neither problem; check on a real device.

## UI primitives (modals, dialogs, popovers, tooltips, menus)

Use the **radix-ui based components** in `packages/client/ui/`:

| Use case | Components |
|---|---|
| Modal / dialog | `Dialog`, `DialogContent`, `DialogTitle`, `DialogActions`, `DialogOverlay`, `DialogClose` from `ui/Dialog/` |
| Alert/confirm dialog | `AlertDialog` and sub-components from `ui/AlertDialog/` |
| Tooltip | `Tooltip`, `TooltipTrigger`, `TooltipContent` from `ui/Tooltip/` |
| Dropdown menu | `Menu`, `MenuItem`, `MenuContent` etc. from `ui/Menu/` |
| Select | `Select`, `SelectContent`, `SelectItem` etc. from `ui/Select/` |

**Do NOT use `DashModal`** (`components/Dashboard/DashModal.tsx`) — it is deprecated.

Manage dialog state with `useDialogState` from `ui/Dialog/useDialogState.tsx`, or pass `isOpen`/`onClose` to `Dialog`. Prefer always rendering the Dialog and controlling it via `isOpen` over conditionally mounting it.

### Dialog actions

Action buttons sit bottom right in `ui/Dialog/DialogActions`: dismiss on the left, the main action rightmost, every button `ui/Button size='md'`. The main action is `primary`, others `outline`. A delete/remove/disconnect main action is still `primary`: there is no destructive button variant, and the copy carries the danger. No raw `<button>`, color overrides or padding classes on `DialogContent` (its viewport already pads 24px), and no bottom padding on the element before `DialogActions` (margins collapse, padding stacks). A centered hero dialog (icon over a centered title) keeps its layout, and a single button there stays centered.

### Buttons

Buttons are rounded rectangles (`rounded-md`, or `Radius.BUTTON` in emotion), never pills or circles: don't put `rounded-full` on a `<button>`, `PlainButton`, `CardButton` or `Button`. `Button`'s `shape` is `'icon' | 'default'`; `icon` only adds `aspect-square`. Badges, chips, status dots, avatars and scrollbar thumbs stay `rounded-full`.

### Select

`ui/Select/SelectContent` defaults to Radix `position='item-aligned'`, which positions only when the trigger renders a `<SelectValue>` **and** the current value matches a rendered `SelectItem`. Otherwise the menu mounts invisible, which looks like "clicking does nothing".
- For an `asChild` trigger, wrap its label in `<SelectValue>{label}</SelectValue>` (carry over `flex`/`min-w-0` so truncation still works). `SelectValue` throws outside a `Select`, so guard a trigger that also renders elsewhere.
- For placeholder or nothing-selected states, pass `position='popper'`.
- Don't cap item-aligned content with `max-h-*`; Radix sizes it from the viewport.

### Radix triggers and focus

Don't style a Radix `Select`/`DropdownMenu` trigger on `focus:` or `focus-visible:`. Radix moves focus into the content and back to the trigger on close, and Chrome keeps the focus-visible state across those hops, so the style lingers after the menu closes (and `opacity-50` reads as disabled). Key trigger styles off `data-[state=open]:` instead.

### Dates

Use `react-day-picker`'s `DayPicker` inside a `@radix-ui/react-popover`, not `<input type="date">`. `global.css` already styles it (`.rdp` rules). Keep the selected date as a `Date` in state and close the popover in `onSelect`.

## Loading states

No route-, page- or panel-sized spinners in a route's `pendingComponent`, a Suspense fallback around a page, or a loading state. While a page loads, a navigation keeps the old page up with `NavigationProgress`, and a cold load leaves the region blank until page-shaped skeletons exist. Small spinners inside a dialog, menu, drawer or picker are fine. See the `relay-and-routing` skill for how page data loads.

## Meeting phases

`PhaseWrapper` centers its content with `justify-center` and no scroll, inside `overflow-hidden` `MeetingContent`. Content taller than the phase area (on a phone, or a tall card) overflows up and down equally, covers the meeting's top bar and can't be scrolled to its end. If `PhaseWrapper` doesn't scroll yet, wrap the content in an outer `flex min-h-0 w-full flex-1 flex-col overflow-y-auto` and an inner `m-auto flex w-full flex-col items-center`: auto margins center content that fits and fall to 0 when it doesn't. Check phases at 375×667 with real data, not an empty state.

## Constants

- **Don't add values to `types/constEnums.ts` or `utils/constants.ts`** — both are deprecated. Put a constant in the module that uses it, or a small file named for it.

## HTML sanitization

**Wrap all external HTML with `sanitizeExternalHtml()` before `dangerouslySetInnerHTML`.** Content from Jira, GitHub, GitLab, Azure DevOps, Linear and user reflections goes through `utils/sanitizeExternalHtml.ts`, which uses DOMPurify, forces links to `target="_blank" rel="noopener noreferrer"` and blocks `<style>`.

```tsx
// Good
<div dangerouslySetInnerHTML={{__html: sanitizeExternalHtml(descriptionHTML)}} />

// Bad — XSS risk
<div dangerouslySetInnerHTML={{__html: descriptionHTML}} />
```

## Component size

- **Target under 100 LOC per component.** Extract self-contained sections (a form section, a list item, a panel) into their own files as a component approaches 100 lines.
- **Hard limit: 300 LOC.**

## React component design

- **Use `onPointerDown`** instead of `onMouseDown` + `onTouchStart`.
- **Prevent unnecessary re-renders:** `useMemo` for expensive computations, `useCallback` for handlers passed to children, early returns in `useEffect` when values haven't changed.
- **Keep `useMemo` factories and `useState` initializers pure.** React 19 dev StrictMode runs a memo factory twice in one render and keeps the first result, so a side effect in it (writing a ref) disagrees with the value returned. Lazy `useState(() => expensive())` is still right for hot paths.
- **Make effects idempotent.** React 19 disconnects and reconnects passive effects (keeping state) when a subtree reappears after Suspense, so an effect that creates an instance without cleanup creates several. Cache the instance in a ref.
- When something works on React 18 but breaks on 19 in dev only, look for the two cases above first.
- **TipTap editors driven by props build once** (`useEditor(..., [])`) and apply later content with `useTipTapEditorSync(editor, contentJSON, editable)`. Never put content in `useEditor` deps: a changed identity rebuilds the editor from stale content.
- **Provide clear user feedback.** Forms need submit buttons or auto-save.

## UI/UX patterns

- **Autocomplete:** Tab and Enter complete suggestions; show a preview of the completion.
- **Stable tag/label colors:** assign colors when tags are created and persist them.
- **Destructive actions need explicit confirmation** with clear labels ("Delete Permanently").
- **Clear role naming:** "Team Lead" and "Member", not "Member team".
- **Limit input sizes:** set `maxLength` on every input.

## Dependencies

- **Consolidate package versions** in the root `package.json`; don't install one package in several `package.json` files (TipTap extensions drifted between server and client this way).
- **The Mattermost plugin renders with Mattermost's React** (`window.React`), whose major depends on the host (Mattermost 10.11 = React 17, 11.x = 18, 12.0 = 19). Both plugin webpack configs alias `react/jsx-runtime` to `hostJsxRuntime.ts`; keep that alias, and don't use React APIs newer than the oldest supported host in code shared with the plugin.

## Code organization

- **Descriptive file names** (`tableOps.ts`, not `data.ts`).
- **Kebab-case HTML/CSS attributes** (`data-is-database`, not `data-isDatabase`).
- **CHANGELOG entries** newest first.
