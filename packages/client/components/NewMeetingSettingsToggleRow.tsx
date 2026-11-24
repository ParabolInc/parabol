import type {FeatureLaunchStatus} from '../hooks/useFeatureLaunch'
import {cn} from '../ui/cn'
import {Info} from '../ui/icons'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import Checkbox from './Checkbox'
import LaunchRing from './LaunchRing'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  active: boolean
  className?: string
  label: string
  tooltip: string
  launch?: FeatureLaunchStatus
  onClick: () => void
}

// The toggle is stretched across the row beneath its content, so the info button sits beside the
// label without being nested inside another button
const NewMeetingSettingsToggleRow = (props: Props) => {
  const {active, className, label, tooltip, launch = 'off', onClick} = props
  return (
    <div
      className={cn(
        'relative flex w-full select-none items-center gap-3 rounded-lg bg-surface-well px-4 py-[22px] has-[>button:hover]:bg-surface-hover',
        className
      )}
    >
      <PlainButton
        role='checkbox'
        aria-checked={active}
        aria-label={label}
        onClick={onClick}
        className='absolute inset-0 rounded-lg bg-transparent focus-visible:ring-2 focus-visible:ring-accent'
      />
      <LaunchRing status={launch} />
      <span className='pointer-events-none relative min-w-0 flex-1 font-semibold text-fg-primary text-xl leading-6'>
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <PlainButton
              aria-label={`About ${label}`}
              className='pointer-events-auto ml-1.5 inline-flex rounded-full align-[-2px] text-fg-muted hover:text-fg-secondary focus-visible:ring-2 focus-visible:ring-accent'
            >
              <Info className='text-lg' />
            </PlainButton>
          </TooltipTrigger>
          <TooltipContent className='max-w-64 whitespace-normal'>{tooltip}</TooltipContent>
        </Tooltip>
      </span>
      <Checkbox
        active={active}
        className={cn(
          'pointer-events-none relative h-7 w-7 shrink-0 select-none text-center text-[28px]',
          active ? 'text-accent' : 'text-fg-primary'
        )}
      />
    </div>
  )
}

export default NewMeetingSettingsToggleRow
