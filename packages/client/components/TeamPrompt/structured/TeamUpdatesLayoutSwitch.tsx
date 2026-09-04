import {type KeyboardEvent, useRef} from 'react'
import {Checklist, GridOn, Notes} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import type {TeamLayout} from './useTeamLayoutPreference'

const OPTIONS: {value: TeamLayout; label: string; Icon: typeof GridOn}[] = [
  {value: 'grid', label: 'Grid', Icon: GridOn},
  {value: 'feed', label: 'Feed', Icon: Notes},
  {value: 'byQuestion', label: 'By question', Icon: Checklist}
]

interface Props {
  layout: TeamLayout
  onChange: (layout: TeamLayout) => void
}

const TeamUpdatesLayoutSwitch = ({layout, onChange}: Props) => {
  const radiosRef = useRef<Record<string, HTMLButtonElement | null>>({})
  const focusLayout = (next: TeamLayout) => {
    onChange(next)
    radiosRef.current[next]?.focus()
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const first = OPTIONS[0]!.value
    const last = OPTIONS[OPTIONS.length - 1]!.value
    if (e.key === 'Home') {
      e.preventDefault()
      focusLayout(first)
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      focusLayout(last)
      return
    }
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (!delta) return
    e.preventDefault()
    const idx = OPTIONS.findIndex((option) => option.value === layout)
    focusLayout(OPTIONS[(idx + delta + OPTIONS.length) % OPTIONS.length]!.value)
  }
  return (
    <div
      role='radiogroup'
      aria-label='Team updates layout'
      onKeyDown={onKeyDown}
      className='flex rounded-md border border-hairline border-solid bg-surface-card p-0.5'
    >
      {OPTIONS.map(({value, label, Icon}) => (
        <button
          key={value}
          ref={(el) => {
            radiosRef.current[value] = el
          }}
          type='button'
          role='radio'
          aria-checked={layout === value}
          tabIndex={layout === value ? 0 : -1}
          onClick={() => onChange(value)}
          className={cn(
            'flex h-7 items-center gap-1 rounded px-2.5 font-semibold text-xs',
            layout === value
              ? 'bg-surface-selected text-fg-selected'
              : 'bg-transparent text-fg-secondary hover:bg-surface-hover'
          )}
        >
          <Icon className='h-4 w-4' />
          {label}
        </button>
      ))}
    </div>
  )
}

export default TeamUpdatesLayoutSwitch
