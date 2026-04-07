---
name: client-components
description: Reference conventions for React client components — Tailwind CSS, UI primitives (Dialog, Tooltip, Menu), constants, HTML sanitization, and component design patterns. Use when building or reviewing UI components in packages/client.
---

# packages/client conventions

## Styling

- **All new components must use Tailwind CSS** — do not use emotion (`styled`, `css` from `@emotion/styled` / `@emotion/react`).
- Biome enforces Tailwind class sort order (`lint/nursery/useSortedClasses`). After modifying a file, run `pnpm exec biome check --write <file>` to auto-fix. Do **not** use `pnpm biome check --write` — the `biome` script already includes `check`, so it would expand to `biome check check --write` and fail.
- **Promote shared classes to the parent.** When two or more sibling elements share the same Tailwind class, move it to their common parent instead of repeating it. Inherited properties (`font-*`, `text-*`, `capitalize`, `leading-*`, `color`) cascade naturally; structural properties (`flex`, `w-*`, `p-*`) usually stay on the element they control.

## UI primitives (modals, dialogs, popovers, tooltips, menus)

Use the **radix-ui based components** in `packages/client/ui/`:

| Use case | Components |
|---|---|
| Modal / dialog | `Dialog`, `DialogContent`, `DialogTitle`, `DialogActions`, `DialogOverlay`, `DialogClose` from `ui/Dialog/` |
| Alert/confirm dialog | `AlertDialog` and sub-components from `ui/AlertDialog/` |
| Tooltip | `Tooltip`, `TooltipTrigger`, `TooltipContent` from `ui/Tooltip/` |
| Dropdown menu | `Menu`, `MenuItem`, `MenuContent` etc. from `ui/Menu/` |
| Select | `Select`, `SelectContent`, `SelectItem` etc. from `ui/Select/` |

**Do NOT use `DashModal`** (`packages/client/components/Dashboard/DashModal.tsx`) — it is deprecated.

Dialog open state can be managed with `useDialogState` from `ui/Dialog/useDialogState.tsx`, or passed as `isOpen`/`onClose` props to `Dialog`. Prefer always rendering the Dialog and controlling via `isOpen` rather than conditionally mounting it.

## Constants

- **Do not add new values to `constEnums.ts`** (`packages/client/types/constEnums.ts`) — it is deprecated.
- Add new constants to `packages/client/utils/constants.ts` as plain `export const` values.

## HTML Sanitization

- **Wrap all external HTML with `sanitizeExternalHtml()` before `dangerouslySetInnerHTML`.** Content from external sources (Jira, GitHub, GitLab, Azure DevOps, Linear, user reflections) must be sanitized via `sanitizeExternalHtml()` from `packages/client/utils/sanitizeExternalHtml.ts`. It uses DOMPurify with a hook that forces links to `target="_blank" rel="noopener noreferrer"` and blocks `<style>` tags.

```tsx
// Good
<div dangerouslySetInnerHTML={{__html: sanitizeExternalHtml(descriptionHTML)}} />

// Bad — XSS risk
<div dangerouslySetInnerHTML={{__html: descriptionHTML}} />
```

## Component Size

- **Target under 100 LOC per component.** If a component is approaching 100 lines, look for self-contained sections (a form section, a list item, a panel) to extract into their own files.
- **Hard limit: 300 LOC.** A component that exceeds 300 lines must be split — no exceptions.

## React Component Design

- **Use `onPointerDown`** instead of `onMouseDown` + `onTouchStart`. The unified pointer API handles mouse, touch, and pen.
- **Prevent unnecessary re-renders:**
  - `useMemo` for expensive computations
  - `useCallback` for event handlers passed to child components
  - Early returns in `useEffect` when values haven't changed (e.g. `if (cellValue !== value)`)
- **Lazy `useState` initialization** for hot-path components: `useState(() => expensiveComputation())` not `useState(expensiveComputation())`. The thunk runs only on mount, not every render.
- **Provide clear user feedback.** Forms need submit buttons or auto-save — don't rely on implicit Enter-to-save without visual cues.

## UI/UX Patterns

- **Autocomplete behavior**: Allow Tab and Enter to complete suggestions. Show a visual preview of what will be completed (inline ghost text or bold matching).
- **Stable tag/label colors**: Assign colors when tags are created and persist them. Don't generate colors from the current text on every keystroke.
- **Destructive actions need explicit confirmation.** Use clear labels like "Delete Permanently" not just "Delete".
- **Clear role naming**: prefer simple names like "Team Lead" and "Member" over "Member team".
- **Validate and limit input sizes** — set `maxLength` on all input fields. Prevent users from pasting megabytes of text into cells.

## Dependencies & Package Management

- **Consolidate package versions** in the root `package.json`. Don't install the same package in multiple `package.json` files — this causes version conflicts (e.g. TipTap extensions with different versions on server vs client).

## Code Organization

- **Use descriptive file names.** Avoid generic names like `data.ts` — prefer `tableOps.ts`, `transforms.ts`, etc.
- **Kebab-case for HTML/CSS attributes.** Use `data-is-database` not `data-isDatabase`.
- **Consistent ordering**: CHANGELOG entries in reverse chronological order (newest first).

## Testing Stripe

- `brew install stripe/stripe-cli/stripe` and then `stripe login` to get the port forwarder up and running
- Use `stripe listen --forward-to https://localhost:3000/stripe --skip-verify` to forward Stripe events to your local server.
