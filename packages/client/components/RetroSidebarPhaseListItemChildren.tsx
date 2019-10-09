import {RetroSidebarPhaseListItemChildren_viewer} from '../__generated__/RetroSidebarPhaseListItemChildren_viewer.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import RetroSidebarDiscussSection from './RetroSidebarDiscussSection'
import {useGotoStageId} from '../hooks/useMeeting'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: keyof typeof NewMeetingPhaseTypeEnum | string
  viewer: RetroSidebarPhaseListItemChildren_viewer
}

const RetroSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, viewer} = props
  const {team} = viewer
  const newMeeting = team && team.newMeeting
  const phases = newMeeting && newMeeting.phases
  const showDiscussSection = phases && isPhaseComplete(NewMeetingPhaseTypeEnum.vote, phases)
  if (phaseType === NewMeetingPhaseTypeEnum.discuss && newMeeting && showDiscussSection) {
    return (
      <RetroSidebarDiscussSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        viewer={viewer}
      />
    )
  }
  return null
}

export default createFragmentContainer(RetroSidebarPhaseListItemChildren, {
  viewer: graphql`
    fragment RetroSidebarPhaseListItemChildren_viewer on User {
      team(teamId: $teamId) {
        newMeeting {
          localPhase {
            phaseType
          }
          phases {
            phaseType
            stages {
              isComplete
            }
          }
        }
      }
      ...RetroSidebarDiscussSection_viewer
    }
  `
})
