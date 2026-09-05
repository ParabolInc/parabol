import {type KeyboardEvent, useRef} from 'react'
import {cn} from '../../../../ui/cn'
import Avatar from '../../../Avatar/Avatar'
import radioGroupNextValue from '../radioGroupNextValue'

const ALL_MEMBERS_CHIP = 'all'

interface Member {
  id: string
  preferredName: string
  picture: string
  isDrafting: boolean
}

interface Props {
  members: readonly Member[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const CHIP =
  'relative flex h-9 shrink-0 items-center rounded-full border border-solid font-semibold text-sm after:-top-1.5 after:-bottom-1.5 after:absolute after:inset-x-0 after:content-[""]'

const TeamUpdatesMemberChips = (props: Props) => {
  const {members, selectedId, onSelect} = props
  const chipsRef = useRef<Record<string, HTMLButtonElement | null>>({})
  const chips = [
    {value: ALL_MEMBERS_CHIP, label: 'All', picture: null, isDrafting: false},
    ...members.map((member) => ({
      value: member.id,
      label: member.preferredName.split(' ')[0] || member.preferredName,
      picture: member.picture,
      isDrafting: member.isDrafting
    }))
  ]
  const current = selectedId ?? ALL_MEMBERS_CHIP
  const select = (value: string) => onSelect(value === ALL_MEMBERS_CHIP ? null : value)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = radioGroupNextValue(
      chips.map((chip) => chip.value),
      current,
      e.key
    )
    if (!next) return
    e.preventDefault()
    select(next)
    chipsRef.current[next]?.focus()
  }
  return (
    <div
      role='tablist'
      aria-label='Teammates'
      onKeyDown={onKeyDown}
      className='flex gap-2 overflow-x-auto px-4 pt-1.5 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    >
      {chips.map(({value, label, picture, isDrafting}) => {
        const isSelected = current === value
        return (
          <button
            key={value}
            ref={(el) => {
              chipsRef.current[value] = el
            }}
            type='button'
            role='tab'
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => select(value)}
            className={cn(
              CHIP,
              picture ? 'gap-2 pr-3 pl-1' : 'px-3',
              isDrafting ? 'text-fg-muted' : 'text-fg-secondary',
              isSelected
                ? 'border-transparent bg-surface-selected text-fg-selected'
                : 'border-hairline-strong bg-surface-card'
            )}
          >
            {picture && (
              <Avatar
                picture={picture}
                alt={label}
                className={cn('h-[26px] w-[26px] shrink-0', isDrafting && 'opacity-55')}
              />
            )}
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default TeamUpdatesMemberChips
