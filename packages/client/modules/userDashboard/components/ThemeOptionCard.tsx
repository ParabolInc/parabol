import {Computer, DarkMode, LightMode} from '@mui/icons-material'
import {cn} from '../../../ui/cn'
import type {ThemePreference} from '../../../utils/themePreference'

interface Props {
  value: ThemePreference
  label: string
  sub: string
  selected: boolean
  onSelect: (value: ThemePreference) => void
}

const ICONS = {light: LightMode, dark: DarkMode, system: Computer}

const LIGHT = {canvas: 'bg-slate-100', bar: 'bg-grape-700', rail: 'bg-slate-200', card: 'bg-white'}
const DARK = {
  canvas: 'bg-[#1e1638]',
  bar: 'bg-[#2d1d53]',
  rail: 'bg-[#130d24]',
  card: 'bg-[#332965]'
}

const MiniPreview = (props: {swatch: typeof LIGHT; withRail?: boolean}) => {
  const {swatch, withRail = true} = props
  return (
    <div className={cn('flex flex-1 flex-col', swatch.canvas)}>
      <div className={cn('h-3 flex-none', swatch.bar)} />
      <div className='flex flex-1'>
        {withRail && <div className={cn('w-8 flex-none', swatch.rail)} />}
        <div className='flex flex-1 gap-1.5 p-2'>
          <div className={cn('h-10 flex-1 rounded-xs shadow-sm', swatch.card)} />
          <div className={cn('h-10 flex-1 rounded-xs shadow-sm', swatch.card)} />
        </div>
      </div>
    </div>
  )
}

const ThemeOptionCard = (props: Props) => {
  const {value, label, sub, selected, onSelect} = props
  const Icon = ICONS[value]
  return (
    <button
      type='button'
      role='radio'
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={cn(
        'flex-1 cursor-pointer overflow-hidden rounded-lg border-2 text-left',
        selected
          ? 'border-accent-active shadow-[0_0_0_1px_var(--color-accent-active)]'
          : 'border-hairline'
      )}
    >
      <div className='flex h-24 overflow-hidden'>
        {value === 'system' ? (
          <>
            <MiniPreview swatch={LIGHT} />
            <MiniPreview swatch={DARK} withRail={false} />
          </>
        ) : (
          <MiniPreview swatch={value === 'dark' ? DARK : LIGHT} />
        )}
      </div>
      <div className='flex items-center gap-2.5 border-hairline border-t bg-surface-raised px-3 py-2.5'>
        <span
          className={cn(
            'flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2',
            selected ? 'border-accent-active' : 'border-hairline-strong'
          )}
        >
          {selected && <span className='h-2 w-2 rounded-full bg-accent-active' />}
        </span>
        <Icon className='flex-none text-[17px] text-fg-secondary' />
        <span className='min-w-0'>
          <span className='block font-semibold text-fg-primary text-sm leading-[18px]'>
            {label}
          </span>
          <span className='block text-fg-muted text-xs leading-4'>{sub}</span>
        </span>
      </div>
    </button>
  )
}

export default ThemeOptionCard
