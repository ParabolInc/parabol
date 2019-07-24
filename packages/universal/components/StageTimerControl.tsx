import React from 'react'
import BottomNavIconLabel from './BottomNavIconLabel'
import BottomNavControl from './BottomNavControl'
import {createFragmentContainer, graphql} from 'react-relay'
import useMenu from '../hooks/useMenu'
import {MenuPosition} from '../hooks/useCoords'
import lazyPreload from '../utils/lazyPreload'
import {StageTimerControl_team} from '../../__generated__/StageTimerControl_team.graphql'
import styled from '@emotion/styled'

interface Props {
  defaultTimeLimit: number
  meetingId: string
  team: StageTimerControl_team
}

const StageTimerModal = lazyPreload(async () =>
  import(/* webpackChunkName: 'StageTimerModal' */ 'universal/components/StageTimerModal')
)

const IconLabel = styled(BottomNavIconLabel)({
  // required to keep an 8px left padding for the modal
  minWidth: 80
})

const StageTimerControl = (props: Props) => {
  const {defaultTimeLimit, meetingId, team} = props
  const {teamMembers, newMeeting, id: teamId} = team
  const {localStage, facilitator} = newMeeting!
  const {isAsync, isComplete, scheduledEndTime} = localStage
  const connectedMemberCount = teamMembers.filter((teamMember) => teamMember.isConnected).length
  const color = scheduledEndTime ? 'green' : 'midGray'
  const icon = isAsync ? 'event' : 'timer'
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLDivElement>(MenuPosition.LOWER_LEFT, {
    isDropdown: true,
    id: 'StageTimerModal'
  })
  if (isComplete) return null
  return (
    <>
      <BottomNavControl onMouseEnter={StageTimerModal.preload} onClick={togglePortal}>
        <IconLabel ref={originRef} icon={icon} iconColor={color} label={'Timer'} />
      </BottomNavControl>
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
        isConnected
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
