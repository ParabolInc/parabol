import type {ReactNode} from 'react'
import {cn} from '../ui/cn'
import Checkbox from './Checkbox'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  active: boolean
  className?: string
  label: ReactNode
  description?: ReactNode
  onClick: () => void
}

const NewMeetingSettingsToggleRow = ({active, className, label, description, onClick}: Props) => (
  <PlainButton
    onClick={onClick}
    className={cn(
      'flex w-full select-none items-center rounded-lg bg-surface-well px-4 py-[22px]',
      'font-semibold text-sm leading-6 hover:bg-surface-hover',
      !!description && 'gap-3 py-4',
      className
    )}
  >
    {description ? (
      <span className='flex min-w-0 flex-1 flex-col gap-1 text-left'>
        <span className='overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-fg-primary text-xl'>
          {label}
        </span>
        <span className='font-normal text-[13px] text-fg-secondary leading-5'>{description}</span>
      </span>
    ) : (
      <span className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-fg-primary text-xl'>
        {label}
      </span>
    )}
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
