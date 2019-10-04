import {MeetingSidebarTeamMemberStageItems_viewer} from '../__generated__/MeetingSidebarTeamMemberStageItems_viewer.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {useGotoStageId} from '../hooks/useMeeting'
// import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
// import TeamMemberStageItem from './TeamMemberStageItem'
import MeetingSubnavItem from '../components/MeetingSubnavItem'
import Avatar from '../components/Avatar/Avatar'
import styled from '@emotion/styled'

const AvatarBlock = styled('div')({
  width: '2rem'
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
  const {teamMembers, newMeeting} = team!
  const {localPhase, localStage} = newMeeting!
  // const agendaItemStageRes = findStageById(phases, agendaItemId, 'agendaItemId')
  const localStageId = (localStage && localStage.id) || ''
  // const isLocalStage = localStageId === stageId

  console.dir(newMeeting.localPhase, 'newMeeting.localPhase')

  const gotoStage = (teamMemberId) => () => {
    const teamMemberStage =
      localPhase && localPhase.stages.find((stage) => stage.teamMemberId === teamMemberId)
    const teamMemberStageId = (teamMemberStage && teamMemberStage.id) || ''
    gotoStageId(teamMemberStageId).catch()
    handleMenuClick()
  }

  return (
    <MeetingSidebarPhaseItemChild>
      {localPhase.stages.map((stage, idx) => {
        // <TeamMemberStageItem
        //   key={teamMember.id}
        //   gotoStage={gotoStage(teamMember.id)}
        //   newMeeting={newMeeting}
        //   teamMember={teamMember}
        // />


        // <div
        //   key={teamMember.id}
        //   onClick={gotoStage(teamMember.id)}
        // >{teamMember.preferredName}</div>
        const {id, isComplete, teamMemberId, teamMember: {picture, preferredName}} = stage

        return (
          <MeetingSubnavItem
            key={id}
            label={preferredName}
            metaContent={
              <AvatarBlock>
                <Avatar hasBadge={false} picture={picture} size={24} />
              </AvatarBlock>
            }
            // isDisabled={isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable}
            onClick={gotoStage(teamMemberId)}
            // orderLabel={`${idx + 1}.`}
            isActive={localStageId === id}
            isComplete={isComplete}
            isDragging={false}
            // isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
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
