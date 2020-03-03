import React from 'react'
import BottomNavIconLabel from './BottomNavIconLabel'
import BottomNavControl from './BottomNavControl'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import useMenu from '../hooks/useMenu'
import {MenuPosition} from '../hooks/useCoords'
import lazyPreload from '../utils/lazyPreload'
import styled from '@emotion/styled'
import {ElementWidth, MeetingLabels} from '../types/constEnums'
import {StageTimerControl_meeting} from '__generated__/StageTimerControl_meeting.graphql'

interface Props {
  defaultTimeLimit: number
  meeting: StageTimerControl_meeting
}

const StageTimerModal = lazyPreload(async () =>
  import(/* webpackChunkName: 'StageTimerModal' */ './StageTimerModal')
)

const IconLabel = styled(BottomNavIconLabel)({
  // required to keep an 8px left padding for the modal
  minWidth: 80
})

const TimerButton = styled(BottomNavControl)({
  width: ElementWidth.END_MEETING_BUTTON
})

const StageTimerControl = (props: Props) => {
  const {defaultTimeLimit, meeting} = props
  const {meetingMembers, localStage, facilitator, id: meetingId} = meeting
  const {isAsync, isComplete, scheduledEndTime} = localStage
  const connectedMemberCount = meetingMembers.filter((member) => member.user.isConnected).length
  const color = scheduledEndTime ? 'green' : 'midGray'
  const icon = isAsync ? 'event' : 'timer'
  const label = isAsync ? MeetingLabels.TIME_LIMIT : MeetingLabels.TIMER
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_LEFT,
    {
      isDropdown: true,
      id: 'StageTimerModal'
    }
  )
  if (isComplete) return null
  return (
    <>
      <TimerButton onMouseEnter={StageTimerModal.preload} onClick={togglePortal}>
        <IconLabel ref={originRef} icon={icon} iconColor={color} label={label} />
      </TimerButton>
      {menuPortal(
        <StageTimerModal
          defaultToAsync={connectedMemberCount <= 1}
          defaultTimeLimit={defaultTimeLimit}
          meetingId={meetingId}
          menuProps={menuProps}
          stage={localStage}
          facilitator={facilitator}
        />
      )}
    </>
  )
}

graphql`
  fragment StageTimerControlStage on NewMeetingStage {
    ...StageTimerModal_stage
    scheduledEndTime
    isAsync
    isComplete
  }
`

export default createFragmentContainer(StageTimerControl, {
  meeting: graphql`
    fragment StageTimerControl_meeting on NewMeeting {
      id
      meetingMembers {
        user {
          isConnected
        }
      }
      localStage {
        ...StageTimerControlStage @relay(mask: false)
      }
      phases {
        stages {
          ...StageTimerControlStage @relay(mask: false)
        }
      }
      facilitator {
        ...StageTimerModal_facilitator
      }
    }
  `
})
