import {type KeyboardEvent, useRef} from 'react'
import {Checklist, GridOn, Notes} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import radioGroupNextValue from './radioGroupNextValue'
import type {TeamLayout} from './useTeamLayoutPreference'

const OPTIONS: {value: TeamLayout; label: string; Icon: typeof GridOn}[] = [
  {value: 'grid', label: 'Grid', Icon: GridOn},
  {value: 'feed', label: 'Feed', Icon: Notes},
  {value: 'byQuestion', label: 'By question', Icon: Checklist}
]
const VALUES = OPTIONS.map(({value}) => value)

interface Props {
  layout: TeamLayout
  onChange: (layout: TeamLayout) => void
}

const TeamUpdatesLayoutSwitch = ({layout, onChange}: Props) => {
  const radiosRef = useRef<Record<string, HTMLButtonElement | null>>({})
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = radioGroupNextValue(VALUES, layout, e.key)
    if (!next) return
    e.preventDefault()
    onChange(next)
    radiosRef.current[next]?.focus()
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
