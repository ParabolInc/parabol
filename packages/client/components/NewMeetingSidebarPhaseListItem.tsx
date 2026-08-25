import {useEffect} from 'react'
import type {NewMeetingPhaseTypeEnum} from '~/__generated__/NewMeetingSettingsToggleCheckIn_settings.graphql'
import {
  Comment,
  Edit,
  Group,
  GroupWork,
  MonitorHeart,
  PlaylistAdd,
  Receipt,
  ThumbsUpDown,
  Update
} from '~/ui/icons'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {Times} from '../types/constEnums'
import {cn} from '../ui/cn'
import {phaseIconLookup, phaseImageLookup, phaseLabelLookup} from '../utils/meetings/lookups'
import Badge from './Badge/Badge'

interface Props {
  handleClick?: () => void
  isActive: boolean
  isCollapsible?: boolean
  isFacilitatorPhase: boolean
  isUnsyncedFacilitatorPhase: boolean
  isUnsyncedFacilitatorStage?: boolean
  phaseCount?: number | null
  phaseLabel?: string
  phaseType: NewMeetingPhaseTypeEnum
  isConfirming?: boolean
}

const NewMeetingSidebarPhaseListItem = (props: Props) => {
  const {
    handleClick,
    isActive,
    isCollapsible,
    isFacilitatorPhase,
    isUnsyncedFacilitatorPhase,
    isUnsyncedFacilitatorStage,
    phaseCount,
    phaseLabel,
    phaseType,
    isConfirming
  } = props
  const isDisabled = !handleClick
  const label = phaseLabel ?? (phaseLabelLookup[phaseType] as string | undefined)
  const icon = phaseIconLookup[phaseType] as string | undefined
  const Image = phaseImageLookup[phaseType as keyof typeof phaseImageLookup]
  const showPhaseCount = Boolean(phaseCount || phaseCount === 0)

  const {openTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      disabled: !isConfirming,
      delay: Times.MEETING_CONFIRM_TOOLTIP_DELAY
    }
  )

  useEffect(() => {
    if (isConfirming) {
      openTooltip()
    }
  }, [isConfirming])

  return (
    <div
      className={cn(
        'relative my-0.5 flex min-h-10 shrink-0 cursor-pointer select-none items-center rounded-md px-2 py-1 font-semibold text-fg-primary text-sm leading-8 no-underline before:absolute before:inset-y-1 before:left-1 before:w-[3px] before:rounded-full before:bg-transparent hover:bg-surface-nav-hover focus:bg-surface-nav-hover',
        isDisabled && 'cursor-not-allowed hover:bg-transparent focus:bg-transparent',
        isActive &&
          'cursor-default bg-surface-nav-active before:bg-(--color-accent-active) hover:bg-surface-nav-active focus:bg-surface-nav-active',
        isCollapsible && isActive && 'bg-transparent hover:cursor-pointer focus:cursor-pointer',
        isCollapsible &&
          isFacilitatorPhase &&
          !isUnsyncedFacilitatorStage &&
          'cursor-default bg-transparent hover:cursor-default hover:bg-transparent focus:cursor-default focus:bg-transparent'
      )}
      onClick={handleClick}
      title={label}
      ref={originRef}
    >
      {icon && (
        <div
          className={cn(
            'flex size-6 shrink-0 items-center justify-center text-fg-nav-muted [&_svg]:size-5',
            isUnsyncedFacilitatorPhase && 'text-rose-500'
          )}
        >
          {
            {
              group: <Group />,
              edit: <Edit />,
              thumbs_up_down: <ThumbsUpDown />,
              comment: <Comment />,
              group_work: <GroupWork />,
              monitor_heart: <MonitorHeart />,
              playlist_add: <PlaylistAdd />,
              update: <Update />,
              receipt: <Receipt />
            }[icon]
          }
        </div>
      )}
      {Image && (
        <div
          className={cn(
            'flex size-6 shrink-0 items-center justify-center [&_svg]:size-5',
            isUnsyncedFacilitatorPhase
              ? '[&_svg_path]:fill-rose-500'
              : '[&_svg_path]:fill-fg-nav-muted'
          )}
        >
          <Image />
        </div>
      )}
      <span className='inline-block pl-2 align-middle text-sm'>{label}</span>
      {showPhaseCount && (
        <div className='ml-auto flex items-center'>
          <Badge className='h-6 min-w-6 rounded-xl bg-slate-600 text-xs leading-6 shadow-none'>
            {phaseCount}
          </Badge>
        </div>
      )}
      {tooltipPortal(`Tap '${label}' again if everyone is ready`)}
    </div>
  )
}

export default NewMeetingSidebarPhaseListItem
