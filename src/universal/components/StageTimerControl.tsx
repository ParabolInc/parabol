import React from 'react'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import BottomNavControl from 'universal/components/BottomNavControl'
import {createFragmentContainer, graphql} from 'react-relay'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import lazyPreload from 'universal/utils/lazyPreload'
import {StageTimerControl_team} from '__generated__/StageTimerControl_team.graphql'

interface Props {
  defaultTimeLimit: number
  meetingId: string
  team: StageTimerControl_team
}

const StageTimerModal = lazyPreload(async () =>
  import(/* webpackChunkName: 'StageTimerModal' */ 'universal/components/StageTimerModal')
)

const StageTimerControl = (props: Props) => {
  const {defaultTimeLimit, meetingId, team} = props
  const {teamMembers, newMeeting, id: teamId} = team
  const {localStage, facilitator} = newMeeting!
  const {isAsync, isComplete, scheduledEndTime} = localStage
  const connectedMemberCount = teamMembers.filter((teamMember) => teamMember.isConnected).length
  const color = scheduledEndTime ? 'green' : 'midGray'
  const icon = isAsync ? 'event' : 'timer'
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu(MenuPosition.LOWER_LEFT, {
    isDropdown: true,
    id: 'StageTimerModal'
  })
  if (isComplete) return null
  return (
    <>
      <BottomNavControl
        innerRef={originRef}
        onMouseEnter={StageTimerModal.preload}
        onClick={togglePortal}
      >
        <BottomNavIconLabel icon={icon} iconColor={color} label={'Timer'} />
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

export default createFragmentContainer(
  StageTimerControl,
  graphql`
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
)
