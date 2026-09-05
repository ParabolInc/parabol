import {type KeyboardEvent, useRef} from 'react'
import {Notes, Person} from '~/ui/icons'
import {cn} from '../../../../ui/cn'
import radioGroupNextValue from '../radioGroupNextValue'
import type {PhoneTeamLayout} from '../useTeamLayoutPreference'

const OPTIONS: {value: PhoneTeamLayout; label: string; Icon: typeof Person}[] = [
  {value: 'person', label: 'Person', Icon: Person},
  {value: 'question', label: 'Question', Icon: Notes}
]
const VALUES = OPTIONS.map(({value}) => value)

interface Props {
  sharedCount: number
  draftingCount: number
  layout: PhoneTeamLayout
  onLayoutChange: (layout: PhoneTeamLayout) => void
}

const TeamUpdatesPhoneHeader = (props: Props) => {
  const {sharedCount, draftingCount, layout, onLayoutChange} = props
  const radiosRef = useRef<Record<string, HTMLButtonElement | null>>({})
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = radioGroupNextValue(VALUES, layout, e.key)
    if (!next) return
    e.preventDefault()
    onLayoutChange(next)
    radiosRef.current[next]?.focus()
  }
  return (
    <div className='flex items-end justify-between px-4 pt-4 pb-2'>
      <div className='min-w-0'>
        <h3 className='m-0 font-semibold text-base'>Team updates</h3>
        <div className='text-fg-muted text-xs'>
          {sharedCount} shared <span aria-hidden>·</span> {draftingCount} drafting
        </div>
      </div>
      <div
        role='radiogroup'
        aria-label='Team updates layout'
        onKeyDown={onKeyDown}
        className='flex shrink-0 rounded-md border border-hairline border-solid bg-surface-card p-0.5'
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
            onClick={() => onLayoutChange(value)}
            className={cn(
              'relative flex h-8 items-center gap-1 rounded px-2.5 font-semibold text-xs',
              'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1',
              'after:-top-2 after:-bottom-2 after:absolute after:inset-x-0 after:content-[""]',
              layout === value
                ? 'bg-surface-selected text-fg-selected'
                : 'bg-transparent text-fg-secondary'
            )}
          >
            <Icon className='h-4 w-4' />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TeamUpdatesPhoneHeader
