import React from 'react'
import BottomNavIconLabel from './BottomNavIconLabel'
import BottomNavControl from './BottomNavControl'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import useMenu from '../hooks/useMenu'
import {MenuPosition} from '../hooks/useCoords'
import lazyPreload from '../utils/lazyPreload'
import {StageTimerControl_team} from '../__generated__/StageTimerControl_team.graphql'
import styled from '@emotion/styled'
import {ElementWidth} from '../types/constEnums'

interface Props {
  defaultTimeLimit: number
  meetingId: string
  team: StageTimerControl_team
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
  const {defaultTimeLimit, meetingId, team} = props
  const {teamMembers, newMeeting, id: teamId} = team
  const {localStage, facilitator} = newMeeting!
  const {isAsync, isComplete, scheduledEndTime} = localStage
  const connectedMemberCount = teamMembers.filter((teamMember) => teamMember.user.isConnected)
    .length
  const color = scheduledEndTime ? 'green' : 'midGray'
  const icon = isAsync ? 'event' : 'timer'
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
        <IconLabel ref={originRef} icon={icon} iconColor={color} label={'Timer'} />
      </TimerButton>
      {menuPortal(
        <StageTimerModal
          defaultToAsync={connectedMemberCount <= 1}
          defaultTimeLimit={defaultTimeLimit}
          meetingId={meetingId}
          menuProps={menuProps}
          stage={localStage}
          facilitator={facilitator}
          teamId={teamId}
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
  team: graphql`
    fragment StageTimerControl_team on Team {
      id
      teamMembers(sortBy: "checkInOrder") {
        user {
          isConnected
        }
      }
      newMeeting {
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
    }
  `
})
