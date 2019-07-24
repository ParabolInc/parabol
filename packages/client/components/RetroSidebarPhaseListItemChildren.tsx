import {RetroSidebarPhaseListItemChildren_viewer} from '../../__generated__/RetroSidebarPhaseListItemChildren_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import RetroSidebarDiscussSection from './RetroSidebarDiscussSection'
import {useGotoStageId} from '../hooks/useMeeting'
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
  const {newMeeting} = team!
  if (
    phaseType === NewMeetingPhaseTypeEnum.discuss &&
    newMeeting &&
    newMeeting.localPhase &&
    newMeeting.localPhase.phaseType === phaseType
  ) {
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
        }
      }
      ...RetroSidebarDiscussSection_viewer
    }
  `
})
