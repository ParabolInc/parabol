import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from 'hooks/useAtmosphere'
import useGotoNext from 'hooks/useGotoNext'
import useGotoStageId from 'hooks/useGotoStageId'
import useTransition from 'hooks/useTransition'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {Breakpoint} from 'types/constEnums'
import {NewMeetingPhaseTypeEnum} from 'types/graphql'
import handleRightArrow from 'utils/handleRightArrow'
import findStageAfterId from 'utils/meetings/findStageAfterId'
import {MeetingControlBar_meeting} from '__generated__/MeetingControlBar_meeting.graphql'
import {bottomBarShadow, desktopBarShadow} from '../styles/elevation'
import BottomControlBarRejoin from './BottomControlBarRejoin'
import BottomControlBarTips from './BottomControlBarTips'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import EndMeetingButton from './EndMeetingButton'
import StageTimerControl from './StageTimerControl'

const Wrapper = styled('div')({
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 4,
  bottom: 16,
  boxShadow: bottomBarShadow,
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  flexWrap: 'nowrap',
  fontSize: 14,
  height: 56,
  justifyContent: 'space-between',
  left: 0,
  margin: '0 auto',
  minHeight: 56,
  padding: 8,
  position: 'absolute',
  right: 0,
  width: 'fit-content',
  // zIndex: ZIndex.BOTTOM_BAR,
  zIndex: 999,

  [`@media screen and (min-width: ${Breakpoint.MEETING_FACILITATOR_BAR}px)`]: {
    boxShadow: desktopBarShadow,
    zIndex: 999
    // zIndex: ZIndex.BOTTOM_BAR_DESKTOP
  }
})

const DEFAULT_TIME_LIMIT = {
  [NewMeetingPhaseTypeEnum.reflect]: 5,
  [NewMeetingPhaseTypeEnum.group]: 5,
  [NewMeetingPhaseTypeEnum.vote]: 3,
  [NewMeetingPhaseTypeEnum.discuss]: 5
}

interface Props {
  handleGotoNext: ReturnType<typeof useGotoNext>
  gotoStageId: ReturnType<typeof useGotoStageId>
  meeting: MeetingControlBar_meeting
}

const MeetingControlBar = (props: Props) => {
  const {handleGotoNext, meeting, gotoStageId} = props
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {
    endedAt,
    facilitatorUserId,
    facilitatorStageId,
    localPhase,
    id: meetingId,
    localStage,
    phases
  } = meeting
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  useEffect(() => {
    return () => {
      // console.log('unmount')
    }
  })
  if (!localPhase || !localStage) {
    return null
  }
  const {phaseType} = localPhase
  const {id: localStageId, isComplete} = localStage
  const isCheckIn = phaseType === NewMeetingPhaseTypeEnum.checkin
  const getPossibleButtons = () => {
    const buttons = ['tips']
    if (!isFacilitating && !isCheckIn && !isComplete) buttons.push('ready')
    if (!isFacilitating && localStageId !== facilitatorStageId) buttons.push('rejoin')
    if (isFacilitating && !isCheckIn && !isComplete) buttons.push('timer')
    if (isFacilitating && findStageAfterId(phases, localStageId)) buttons.push('next')
    if (isFacilitating) buttons.push('end')
    return buttons.map((key) => ({key}))
  }
  const buttons = getPossibleButtons()
  const tranChildren = useTransition(buttons)
  if (endedAt) return null
  console.log('show', tranChildren)
  return (
    <Wrapper>
      {tranChildren
        .map((tranChild) => {
          const {onTransitionEnd, child, status} = tranChild
          const {key} = child
          const tranProps = {onTransitionEnd, status, key}
          switch (key) {
            case 'tips':
              return <BottomControlBarTips {...tranProps} meeting={meeting} />
            case 'ready':
              return null
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
                  defaultTimeLimit={DEFAULT_TIME_LIMIT[phaseType]}
                  meeting={meeting}
                />
              )
            case 'next':
              const isBouncing = false
              return (
                <BottomNavControl
                  {...tranProps}
                  isBouncing={isBouncing}
                  onClick={() => gotoNext()}
                  ref={gotoNextRef}
                  onKeyDown={handleRightArrow(() => gotoNext())}
                >
                  <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={'Next'} />
                </BottomNavControl>
              )
            case 'end':
              return <EndMeetingButton {...tranProps} meetingId={meetingId} isEnded={!!endedAt} />
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
      ...StageTimerControl_meeting
      id
      endedAt
      facilitatorStageId
      facilitatorUserId
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
