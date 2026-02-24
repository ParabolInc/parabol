# packages/client conventions

## Styling

- **All new components must use Tailwind CSS** — do not use emotion (`styled`, `css` from `@emotion/styled` / `@emotion/react`).
- Biome enforces Tailwind class sort order (`lint/nursery/useSortedClasses`). Run `pnpm biome` — it autofixes on save.

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
