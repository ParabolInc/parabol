// @flow
import React from 'react'
import {DISCUSS, VOTE} from 'universal/utils/constants'
import {createFragmentContainer, graphql} from 'react-relay'
import {withRouter} from 'react-router-dom'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import RetroSidebarVoteSection from 'universal/components/RetroSidebarVoteSection'
import type {NewMeetingSidebarPhaseListItemChildren_viewer as Viewer} from './__generated__/NewMeetingSidebarPhaseListItemChildren_viewer.graphql' // eslint-disable-line
import type {NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow'
import RetroSidebarDiscussSection from 'universal/components/RetroSidebarDiscussSection'

type Props = {|
  gotoStageId: (stageId: string) => void,
  phaseType: NewMeetingPhaseTypeEnum,
  viewer: Viewer
|}

const NewMeetingSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, phaseType, viewer} = props
  const {team} = viewer
  const {newMeeting} = team
  if (!newMeeting || !newMeeting.localPhase || newMeeting.localPhase.phaseType !== phaseType) {
    return null
  }
  if (phaseType === VOTE) {
    return <RetroSidebarVoteSection viewer={viewer} />
  } else if (phaseType === DISCUSS) {
    return <RetroSidebarDiscussSection gotoStageId={gotoStageId} viewer={viewer} />
  }
  return null
}

export default createFragmentContainer(
  withAtmosphere(withRouter(NewMeetingSidebarPhaseListItemChildren)),
  graphql`
    fragment NewMeetingSidebarPhaseListItemChildren_viewer on User {
      team(teamId: $teamId) {
        newMeeting {
          localPhase {
            phaseType
          }
        }
      }
      ...RetroSidebarVoteSection_viewer
      ...RetroSidebarDiscussSection_viewer
    }
  `
)
