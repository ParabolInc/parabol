import {NewMeetingSidebarPhaseListItemChildren_viewer} from '__generated__/NewMeetingSidebarPhaseListItemChildren_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import RetroSidebarDiscussSection from 'universal/components/RetroSidebarDiscussSection'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DISCUSS} from 'universal/utils/constants'
import NewMeetingPhaseTypeEnum = GQL.NewMeetingPhaseTypeEnum

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  gotoStageId: (stageId: string) => void
  phaseType: keyof typeof NewMeetingPhaseTypeEnum | string
  viewer: NewMeetingSidebarPhaseListItemChildren_viewer
}

const NewMeetingSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, phaseType, viewer} = props
  const {team} = viewer
  const {newMeeting} = team
  if (!newMeeting || !newMeeting.localPhase || newMeeting.localPhase.phaseType !== phaseType) {
    return null
  }
  if (phaseType === DISCUSS) {
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
      ...RetroSidebarDiscussSection_viewer
    }
  `
)
