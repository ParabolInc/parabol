import {DateRange, Tune} from '~/ui/icons'
import {cn} from '../../../ui/cn'

interface Props {
  dateLabel: string
  hasInstructions: boolean
  onClick: () => void
}

const InspirationSettingsButton = (props: Props) => {
  const {dateLabel, hasInstructions, onClick} = props
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={`Draft settings: ${dateLabel}, instructions ${hasInstructions ? 'on' : 'off'}`}
      className='flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-hairline-strong bg-surface-card px-2.5 text-left text-fg-primary text-sm hover:bg-surface-hover'
    >
      <DateRange className='size-4 text-fg-secondary' />
      <span className='flex-1'>{dateLabel}</span>
      <span className='relative flex'>
        <Tune className={cn('size-4', hasInstructions ? 'text-accent' : 'text-fg-secondary')} />
        {hasInstructions && (
          <span className='-top-1 -right-1 absolute size-2 rounded-full border border-surface-card bg-accent' />
        )}
      </span>
    </button>
  )
}

export default InspirationSettingsButton
