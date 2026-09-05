import {type KeyboardEvent, useEffect, useRef} from 'react'
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
  const listRef = useRef<HTMLDivElement>(null)
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
  useEffect(() => {
    const chip = chipsRef.current[current]
    const list = listRef.current
    if (!chip || !list) return
    const left = chip.offsetLeft - (list.clientWidth - chip.clientWidth) / 2
    list.scrollTo({left: Math.max(0, left), behavior: 'smooth'})
  }, [current])
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
  if (members.length === 0) return null
  return (
    <div
      ref={listRef}
      role='tablist'
      aria-label='Teammates'
      onKeyDown={onKeyDown}
      className='sticky top-0 z-10 flex gap-2 overflow-x-auto bg-surface-app px-4 pt-1.5 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
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
            aria-label={label}
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
            <span className='max-w-[140px] truncate'>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default TeamUpdatesMemberChips
