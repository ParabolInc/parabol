import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingControlBar_meeting} from '~/__generated__/MeetingControlBar_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useCovering} from '~/hooks/useControlBarCovers'
import useDraggableFixture from '~/hooks/useDraggableFixture'
import useGotoNext from '~/hooks/useGotoNext'
import useGotoStageId from '~/hooks/useGotoStageId'
import useInitialRender from '~/hooks/useInitialRender'
import useTransition, {TransitionStatus} from '~/hooks/useTransition'
import {PALETTE} from '~/styles/paletteV2'
import {BezierCurve, Breakpoint, DiscussionThreadEnum, NavSidebar, ZIndex} from '~/types/constEnums'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '~/types/graphql'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import findStageAfterId from '~/utils/meetings/findStageAfterId'
import styled from '@emotion/styled'
import useClickConfirmation from '../hooks/useClickConfirmation'
import useSnackbarPad from '../hooks/useSnackbarPad'
import {bottomBarShadow, desktopBarShadow} from '../styles/elevation'
import BottomControlBarReady from './BottomControlBarReady'
import BottomControlBarRejoin from './BottomControlBarRejoin'
import BottomControlBarTips from './BottomControlBarTips'
import EndMeetingButton from './EndMeetingButton'
import StageTimerControl from './StageTimerControl'

const Wrapper = styled('div')<{isLeftSidebarOpen: boolean; isRightDrawerOpen: boolean}>(
  ({isLeftSidebarOpen, isRightDrawerOpen}) => ({
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    bottom: 0,
    boxShadow: bottomBarShadow,
    color: PALETTE.TEXT_GRAY,
    display: 'flex',
    flexWrap: 'nowrap',
    fontSize: 14,
    height: 56,
    justifyContent: 'space-between',
    left: isLeftSidebarOpen ? NavSidebar.WIDTH : 0,
    margin: '0 auto',
    minHeight: 56,
    padding: 8,
    position: 'fixed',
    right: isRightDrawerOpen ? DiscussionThreadEnum.WIDTH : 0,
    transition: `200ms ${BezierCurve.DECELERATE}`,
    width: '100%',
    zIndex: ZIndex.BOTTOM_BAR,
    [makeMinWidthMediaQuery(Breakpoint.SINGLE_REFLECTION_COLUMN)]: {
      borderRadius: 4,
      bottom: 8,
      boxShadow: desktopBarShadow,
      width: 'fit-content'
    }
  })
)

const DEFAULT_TIME_LIMIT = {
  [NewMeetingPhaseTypeEnum.reflect]: 5,
  [NewMeetingPhaseTypeEnum.group]: 5,
  [NewMeetingPhaseTypeEnum.vote]: 3,
  [NewMeetingPhaseTypeEnum.discuss]: 5
}

interface Props {
  handleGotoNext: ReturnType<typeof useGotoNext>
  isDemoStageComplete?: boolean
  gotoStageId: ReturnType<typeof useGotoStageId>
  meeting: MeetingControlBar_meeting
  isRightDrawerOpen?: boolean
}

const MeetingControlBar = (props: Props) => {
  const {
    handleGotoNext,
    isDemoStageComplete,
    meeting,
    gotoStageId,
    isRightDrawerOpen = false
  } = props
  const atmosphere = useAtmosphere()
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
    showSidebar: isLeftSidebarOpen
  } = meeting
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const {phaseType} = localPhase
  const {id: localStageId, isComplete} = localStage
  const isCheckIn = phaseType === NewMeetingPhaseTypeEnum.checkin
  const isRetro = meetingType === MeetingTypeEnum.retrospective
  const isPoker = meetingType === MeetingTypeEnum.poker
  const getPossibleButtons = () => {
    const buttons = ['tips']
    if (!isFacilitating && !isCheckIn && !isComplete && !isPoker) buttons.push('ready')
    if (!isFacilitating && localStageId !== facilitatorStageId) buttons.push('rejoin')
    if (isFacilitating && isRetro && !isCheckIn && !isComplete) buttons.push('timer')
    if ((isFacilitating || isPoker) && findStageAfterId(phases, localStageId)) buttons.push('next')
    if (isFacilitating) buttons.push('end')
    return buttons.map((key) => ({key}))
  }
  const buttons = getPossibleButtons()
  const [confirmingButton, setConfirmingButton] = useClickConfirmation()
  const cancelConfirm = confirmingButton ? () => setConfirmingButton('') : undefined
  const tranChildren = useTransition(buttons)
  const {onMouseDown, onClickCapture} = useDraggableFixture(isLeftSidebarOpen, isRightDrawerOpen)
  const ref = useRef<HTMLDivElement>(null)
  useSnackbarPad(ref)
  useCovering(ref)
  const isInit = useInitialRender()
  if (endedAt) return null
  return (
    <Wrapper
      ref={ref}
      onMouseDown={onMouseDown}
      onClickCapture={onClickCapture}
      onTouchStart={onMouseDown}
      isLeftSidebarOpen={isLeftSidebarOpen}
      isRightDrawerOpen={isRightDrawerOpen}
    >
      {tranChildren
        .map((tranChild) => {
          const {onTransitionEnd, child, status} = tranChild
          const {key} = child
          const tranProps = {
            onTransitionEnd,
            status: isInit ? TransitionStatus.ENTERED : status,
            key
          }
          switch (key) {
            case 'tips':
              return (
                <BottomControlBarTips
                  {...tranProps}
                  meeting={meeting}
                  cancelConfirm={cancelConfirm}
                />
              )
            case 'ready':
            case 'next':
              return (
                <BottomControlBarReady
                  {...tranProps}
                  isNext={isPoker ? true : isFacilitating}
                  cancelConfirm={isPoker ? undefined : confirmingButton === 'next' ? undefined : cancelConfirm}
                  isConfirming={isPoker ? false : confirmingButton === 'next'}
                  setConfirmingButton={setConfirmingButton}
                  isDemoStageComplete={isDemoStageComplete}
                  meeting={meeting}
                  handleGotoNext={handleGotoNext}
                />
              )
            case 'rejoin':
              return (
                <BottomControlBarRejoin
                  {...tranProps}
                  onClick={() => gotoStageId(facilitatorStageId)}
                />
              )
            case 'timer':
              return (
                <StageTimerControl
                  {...tranProps}
                  cancelConfirm={cancelConfirm}
                  defaultTimeLimit={DEFAULT_TIME_LIMIT[phaseType]}
                  meeting={meeting}
                />
              )
            case 'end':
              return (
                <EndMeetingButton
                  {...tranProps}
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
        })
        .filter(Boolean)}
    </Wrapper>
  )
}

export default createFragmentContainer(MeetingControlBar, {
  meeting: graphql`
    fragment MeetingControlBar_meeting on NewMeeting {
      ...BottomControlBarTips_meeting
      ...BottomControlBarReady_meeting
      ...StageTimerControl_meeting
      id
      endedAt
      facilitatorStageId
      facilitatorUserId
      meetingType
      showSidebar
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
  `
})
