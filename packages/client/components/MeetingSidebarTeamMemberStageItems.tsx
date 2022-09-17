import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingSidebarTeamMemberStageItems_meeting} from '~/__generated__/MeetingSidebarTeamMemberStageItems_meeting.graphql'
import Avatar from '../components/Avatar/Avatar'
import MeetingSubnavItem from '../components/MeetingSubnavItem'
import useAnimatedPhaseListChildren from '../hooks/useAnimatedPhaseListChildren'
import useAtmosphere from '../hooks/useAtmosphere'
import useGotoStageId from '../hooks/useGotoStageId'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionMeeting_meeting.graphql'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'

const AvatarBlock = styled('div')({
  width: 32
})

const ScrollStageItems = styled('div')<{isActive: boolean}>(({isActive}) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // trickle down height for overflow
  // react-beautiful-dnd supports scrolling on 1 parent
  // this is where we need it, in order to scroll a long list
  overflow: isActive ? 'auto' : 'hidden',
  paddingRight: 8,
  width: '100%'
}))

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: MeetingSidebarTeamMemberStageItems_meeting
  phaseType: NewMeetingPhaseTypeEnum
}

const MeetingSidebarTeamMemberStageItems = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting, phaseType} = props
  const {facilitatorStageId, facilitatorUserId, localPhase, localStage, phases} = meeting
  const sidebarPhase = phases.find((phase) => phase.phaseType === phaseType)
  const localStageId = (localStage && localStage.id) || ''
  const gotoStage = (teamMemberId: string) => () => {
    const teamMemberStage =
      sidebarPhase && sidebarPhase.stages.find((stage) => stage.teamMemberId === teamMemberId)
    const teamMemberStageId = (teamMemberStage && teamMemberStage.id) || ''
    gotoStageId(teamMemberStageId).catch()
    handleMenuClick()
  }
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isActive = !!(localPhase && localPhase.phaseType === sidebarPhase?.phaseType)
  const isViewerFacilitator = viewerId === facilitatorUserId
  const childItemCount = sidebarPhase ? sidebarPhase.stages.length : 0
  const {height, ref} = useAnimatedPhaseListChildren(isActive, childItemCount)
  return (
    <MeetingSidebarPhaseItemChild minHeight={height} height={height}>
      <ScrollStageItems isActive={isActive} ref={ref}>
        {sidebarPhase?.stages.map((stage) => {
          const {
            id: stageId,
            isComplete,
            teamMemberId,
            teamMember,
            isNavigableByFacilitator,
            isNavigable
          } = stage
          if (!teamMember) {
            return null
          }
          const {picture, preferredName} = teamMember
          const isLocalStage = localStageId === stageId
          const isFacilitatorStage = facilitatorStageId === stageId
          const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage && !isLocalStage
          return (
            <MeetingSubnavItem
              key={stageId}
              metaContent={
                <AvatarBlock>
                  <Avatar hasBadge={false} picture={picture} size={24} />
                </AvatarBlock>
              }
              isDisabled={isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable}
              onClick={gotoStage(teamMemberId!)}
              isActive={localStageId === stageId}
              isComplete={isComplete}
              isDragging={false}
              isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
            >
              {preferredName}
            </MeetingSubnavItem>
          )
        })}
      </ScrollStageItems>
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
  meeting: graphql`
    fragment MeetingSidebarTeamMemberStageItems_meeting on NewMeeting {
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
  `
})
