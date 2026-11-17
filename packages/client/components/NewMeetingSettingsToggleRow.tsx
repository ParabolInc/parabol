import type {ReactNode} from 'react'
import {cn} from '../ui/cn'
import Checkbox from './Checkbox'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  active: boolean
  className?: string
  label: ReactNode
  onClick: () => void
}

const NewMeetingSettingsToggleRow = ({active, className, label, onClick}: Props) => (
  <PlainButton
    onClick={onClick}
    className={cn(
      'flex w-full select-none items-center rounded-lg bg-surface-well px-4 py-[22px]',
      'font-semibold text-sm leading-6 hover:bg-surface-hover',
      className
    )}
  >
    <span className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-fg-primary text-xl'>
      {label}
    </span>
    <Checkbox
      active={active}
      className={cn(
        'h-7 w-7 select-none text-center text-[28px]',
        active ? 'text-accent' : 'text-fg-primary'
      )}
    />
  </PlainButton>
)

export default NewMeetingSettingsToggleRow
