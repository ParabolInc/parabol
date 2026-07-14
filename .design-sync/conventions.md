# Parabol design system — how to build with it

Parabol's UI is **React + Radix primitives styled with Tailwind utility classes** over a custom brand palette (paletteV3). There is **no theme-provider or CSS-in-JS to set up** — the utility classes are global (shipped in `styles.css`). Import a component and style layout with the utility classes below.

## Styling idiom: Tailwind utilities over the paletteV3 palette

Style with Tailwind utility classes. **Colors do NOT use the default Tailwind palette** — they use Parabol's paletteV3. Use `bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*` with these families, each in weights `100`–`900` (e.g. `bg-sky-500`, `text-slate-700`, `border-slate-300`):

| Family | Typical use |
|---|---|
| `slate` | text (`text-slate-700`), surfaces (`bg-slate-100/200`), borders |
| `sky` | primary interactive / info (buttons, focus ring `ring-sky-500`) |
| `tomato` | destructive / error |
| `grape` | brand accent, dialog primary actions (`bg-grape-700`) |
| `rose` | primary-gradient end, highlights |
| `gold`, `grass`, `forest`, `jade`, `aqua`, `lilac`, `fuscia`, `terra` | categorical / meeting theming |

Plus semantics: `primary` (`#493272`, deep grape), `success-light`, `black`, `white`. Type: `font-sans` = **IBM Plex Sans** (default), `font-mono` = **IBM Plex Mono**. Everything else is stock Tailwind (`flex`, `gap-3`, `rounded-md`, `p-4`, `text-sm`, `font-semibold`, `shadow-card`). Never invent color names outside these families; never use inline `style={{color}}` when a class exists.

## Key components

- **Button** — `variant`: `primary` (tomato→rose gradient), `secondary` (sky), `destructive` (tomato), `outline`, `ghost`, `link`, `flat`, `dialogPrimary` (grape); `size`: `sm|md|lg`; `shape`: `pill|circle`. `<Button variant='primary' size='md'>Save</Button>`
- **Chip** — `label`, optional `icon`/`picture`, `onDelete`.
- **Checkbox** — `checked` (`true|false|'indeterminate'`), `disabled`.
- **Input**, **Avatar** (`Avatar`/`AvatarImage`/`AvatarFallback`), **RadioGroup**/`RadioGroupItem`.
- **Compound Radix components** compose as Root + parts, e.g. **Dialog** (`Dialog`/`DialogTrigger`/`DialogContent`/`DialogTitle`/`DialogDescription`/`DialogActions`/`DialogClose`), **Menu** (`Menu` takes a `trigger` prop + `MenuItem` children), **Select** (`Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`), **Tooltip** (`Tooltip`/`TooltipTrigger`/`TooltipContent`), **AlertDialog**.

Feature components (Team Dashboard, Retrospective, Estimate/Poker, Team Prompt, Org Admin groups) are real presentational pieces from the app — compose them with the same utility-class idiom.

## Where the truth lives

Read the bound copies before styling: the stylesheet closure from `styles.css` (paletteV3 `@theme` tokens + component CSS), and each component's `<Name>.d.ts` (prop contract) and `<Name>.prompt.md` (usage). Those are authoritative over this summary.

## One idiomatic example

```tsx
import {Button, Chip} from 'parabol-client'

function SprintRetroHeader() {
  return (
    <div className='flex items-center justify-between gap-4 rounded-md bg-slate-100 p-4'>
      <div className='flex items-center gap-2'>
        <h2 className='font-sans font-semibold text-slate-700 text-lg'>Sprint Retrospective</h2>
        <Chip label='In progress' />
      </div>
      <Button variant='primary' size='md'>Start meeting</Button>
    </div>
  )
}
```
