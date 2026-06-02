import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {MeetingControlBar_meeting$key} from '~/__generated__/MeetingControlBar_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useBreakpoint from '~/hooks/useBreakpoint'
import {useCovering} from '~/hooks/useControlBarCovers'
import useDraggableFixture from '~/hooks/useDraggableFixture'
import type useGotoNext from '~/hooks/useGotoNext'
import type useGotoStageId from '~/hooks/useGotoStageId'
import useLeft from '~/hooks/useLeft'
import {BezierCurve, Breakpoint, ElementWidth, ZIndex} from '~/types/constEnums'
import findStageAfterId from '~/utils/meetings/findStageAfterId'
import type {NewMeetingPhaseTypeEnum} from '../__generated__/MeetingControlBar_meeting.graphql'
import useClickConfirmation from '../hooks/useClickConfirmation'
import {bottomBarShadow, desktopBarShadow} from '../styles/elevation'
import showTimerInPhase from '../utils/showTimerInPhase'
import BottomControlBarMusic from './BottomControlBarMusic'
import BottomControlBarReady from './BottomControlBarReady'
import BottomControlBarRejoin from './BottomControlBarRejoin'
import BottomControlBarTips from './BottomControlBarTips'
import EndMeetingButton from './EndMeetingButton'
import StageTimerControl from './StageTimerControl'

const DEFAULT_TIME_LIMIT = {
  reflect: 5,
  group: 5,
  vote: 3,
  discuss: 5,
  ESTIMATE: 5,
  SCOPE: 3,
  TEAM_HEALTH: 1
} as Record<NewMeetingPhaseTypeEnum, number>

interface Props {
  handleGotoNext: ReturnType<typeof useGotoNext>
  isDemoStageComplete?: boolean
  gotoStageId: ReturnType<typeof useGotoStageId>
  meeting: MeetingControlBar_meeting$key
}
const MeetingControlBar = (props: Props) => {
  const {handleGotoNext, isDemoStageComplete, meeting: meetingRef, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment MeetingControlBar_meeting on NewMeeting {
        ...BottomControlBarReady_meeting
        ...BottomControlBarReady_meeting @relay(mask: false)
        ...BottomControlBarTips_meeting
        ...StageTimerControl_meeting
        id
        endedAt
        facilitatorStageId
        facilitatorUserId
        meetingType
        showSidebar
        ... on PokerMeeting {
          isRightDrawerOpen
        }
        localStage {
          id
          isComplete
        }
        localPhase {
          phaseType
          stages {
            id
            isComplete
          }
        }
        phases {
          phaseType
          stages {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const {viewerId} = atmosphere
  const {
    endedAt,
    facilitatorUserId,
    facilitatorStageId,
    localPhase,
    id: meetingId,
    localStage,
    phases,
    meetingType,
    showSidebar,
    isRightDrawerOpen = false
  } = meeting
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const {phaseType} = localPhase
  const {id: localStageId, isComplete} = localStage
  const isCheckIn = phaseType === 'checkin'
  const isPoker = meetingType === 'poker'
  const getPossibleButtons = () => {
    const buttons = ['music']
    if (isFacilitating && !isComplete && showTimerInPhase(phaseType)) buttons.push('timer')
    if (isDesktop) buttons.push('tips')
    if (!isFacilitating && !isCheckIn && !isComplete && !isPoker) buttons.push('ready')
    if (!isFacilitating && localStageId !== facilitatorStageId) buttons.push('rejoin')
    if ((isFacilitating || isPoker) && findStageAfterId(phases, localStageId)) buttons.push('next')
    if (isFacilitating) buttons.push('end')
    return buttons.map((key) => ({key}))
  }
  const buttons = getPossibleButtons()
  const [confirmingButton, setConfirmingButton] = useClickConfirmation()
  const cancelConfirm = confirmingButton ? () => setConfirmingButton('') : undefined
  const controlBarWidth =
    buttons.length * ElementWidth.CONTROL_BAR_BUTTON + ElementWidth.CONTROL_BAR_PADDING * 2
  const left = useLeft(controlBarWidth, isRightDrawerOpen, showSidebar)
  const controlBarLeft = isDesktop ? left : 0
  const {onMouseDown, onClickCapture} = useDraggableFixture(showSidebar, isRightDrawerOpen)
  const ref = useRef<HTMLDivElement>(null)
  useCovering(ref)
  if (endedAt) return null

  const renderButton = (key: string) => {
    switch (key) {
      case 'music':
        return <BottomControlBarMusic meetingId={meetingId} />
      case 'tips':
        return <BottomControlBarTips meeting={meeting} cancelConfirm={cancelConfirm} />
      case 'ready':
      case 'next':
        return (
          <BottomControlBarReady
            isNext={isPoker ? true : isFacilitating}
            isFacilitating={isFacilitating}
            isPoker={isPoker}
            cancelConfirm={
              isPoker ? undefined : confirmingButton === 'next' ? undefined : cancelConfirm
            }
            isConfirming={isPoker ? false : confirmingButton === 'next'}
            setConfirmingButton={setConfirmingButton}
            isDemoStageComplete={isDemoStageComplete}
            meeting={meeting}
            handleGotoNext={handleGotoNext}
          />
        )
      case 'rejoin':
        return <BottomControlBarRejoin onClick={() => gotoStageId(facilitatorStageId)} />
      case 'timer':
        return (
          <StageTimerControl
            cancelConfirm={cancelConfirm}
            defaultTimeLimit={DEFAULT_TIME_LIMIT[phaseType] ?? 1}
            meeting={meeting}
          />
        )
      case 'end':
        return (
          <EndMeetingButton
            cancelConfirm={confirmingButton === 'end' ? undefined : cancelConfirm}
            isConfirming={confirmingButton === 'end'}
            setConfirmingButton={setConfirmingButton}
            meetingId={meetingId}
            meetingType={meetingType}
            isEnded={!!endedAt}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={ref}
      className='fixed bottom-0 single-reflection-column:bottom-2 flex h-14 min-h-14 single-reflection-column:w-auto w-full flex-nowrap items-center justify-between single-reflection-column:rounded bg-white p-2 text-slate-600 text-sm'
      style={{
        left: controlBarLeft,
        boxShadow: isDesktop ? desktopBarShadow : bottomBarShadow,
        transition: `all 200ms ${BezierCurve.DECELERATE}`,
        zIndex: ZIndex.BOTTOM_BAR
      }}
      onMouseDown={onMouseDown}
      onClickCapture={onClickCapture}
      onTouchStart={onMouseDown}
    >
      {buttons.map(({key}) => renderButton(key))}
    </div>
  )
}

export default MeetingControlBar
