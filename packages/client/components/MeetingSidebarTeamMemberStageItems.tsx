import {MeetingSidebarTeamMemberStageItems_viewer} from '../__generated__/MeetingSidebarTeamMemberStageItems_viewer.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {useGotoStageId} from '../hooks/useMeeting'
import useAtmosphere from '../hooks/useAtmosphere'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import MeetingSubnavItem from '../components/MeetingSubnavItem'
import Avatar from '../components/Avatar/Avatar'
import styled from '@emotion/styled'

const AvatarBlock = styled('div')({
  width: 32
})

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  viewer: MeetingSidebarTeamMemberStageItems_viewer
}

const MeetingSidebarTeamMemberStageItems = (props: Props) => {
  const {
    gotoStageId,
    handleMenuClick,
    viewer: {team}
  } = props
  const {newMeeting} = team!
  const {facilitatorStageId, facilitatorUserId, localPhase, localStage} = newMeeting!
  const localStageId = (localStage && localStage.id) || ''
  const gotoStage = (teamMemberId) => () => {
    const teamMemberStage = localPhase && localPhase.stages.find((stage) => stage.teamMemberId === teamMemberId)
    const teamMemberStageId = (teamMemberStage && teamMemberStage.id) || ''
    gotoStageId(teamMemberStageId).catch()
    handleMenuClick()
  }
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isViewerFacilitator = viewerId === facilitatorUserId
  return (
    <MeetingSidebarPhaseItemChild>
      {localPhase.stages.map((stage) => {
        const {id: stageId, isComplete, teamMemberId, teamMember, isNavigableByFacilitator, isNavigable} = stage
        const {picture, preferredName} = teamMember!
        const isLocalStage = localStageId === stageId
        const isFacilitatorStage = facilitatorStageId === stageId
        const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage && !isLocalStage
        return (
          <MeetingSubnavItem
            key={stageId}
            label={preferredName}
            metaContent={
              <AvatarBlock>
                <Avatar hasBadge={false} picture={picture} size={24} />
              </AvatarBlock>
            }
            isDisabled={isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable}
            onClick={gotoStage(teamMemberId)}
            isActive={localStageId === stageId}
            isComplete={isComplete}
            isDragging={false}
            isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
          />
        )
      })}
    </MeetingSidebarPhaseItemChild>
  )
}

graphql`
  fragment MeetingSidebarTeamMemberStageItems_phase on NewMeetingPhase {
    id
    phaseType
    stages {
      id
      isComplete
      isComplete
      isNavigable
      isNavigableByFacilitator
      ... on NewMeetingTeamMemberStage {
        teamMemberId
        teamMember {
          picture
          preferredName
        }
      }
    }
  }
`

export default createFragmentContainer(MeetingSidebarTeamMemberStageItems, {
  viewer: graphql`
    fragment MeetingSidebarTeamMemberStageItems_viewer on User {
      team(teamId: $teamId) {
        teamMembers(sortBy: "checkInOrder") {
          id
          picture
          preferredName
        }
        newMeeting {
          facilitatorStageId
          facilitatorUserId
          id
          localPhase {
          ...MeetingSidebarTeamMemberStageItems_phase @relay(mask: false)
          }
          localStage {
            id
          }
          phases {
            ...MeetingSidebarTeamMemberStageItems_phase @relay(mask: false)
          }
        }
      }
    }
  `
})
