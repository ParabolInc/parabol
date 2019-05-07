import {ActionMeeting_viewer} from '__generated__/ActionMeeting_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {ValueOf} from 'types/generics'
import NewMeeting, {NewMeetingTypeProps} from 'universal/components/NewMeeting'
import useMeeting from 'universal/hooks/newMeeting'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import lazyPreload from 'universal/utils/lazyPreload'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'

interface Props {
  viewer: ActionMeeting_viewer
}

const phaseLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingCheckIn' */ 'universal/components/NewMeetingCheckIn')
  ),
  // [NewMeetingPhaseTypeEnum.updates]: lazyPreload(() =>
  //   import(/* webpackChunkName: 'ActionMeetingUpdates' */ 'universal/components/ActionMeetingUpdates')
  // ),
  // [NewMeetingPhaseTypeEnum.firstcall]: lazyPreload(() =>
  //   import(/* webpackChunkName: 'ActionMeetingFirstCall' */ 'universal/components/ActionMeetingFirstCall')
  // ),
  // [NewMeetingPhaseTypeEnum.agendaitems]: lazyPreload(() =>
  //   import(/* webpackChunkName: 'ActionMeetingAgendaItems' */ 'universal/components/ActionMeetingAgendaItems')
  // ),
  // [NewMeetingPhaseTypeEnum.lastcall]: lazyPreload(() =>
  //   import(/* webpackChunkName: 'ActionMeetingLastCall' */ 'universal/components/ActionMeetingLastCall')
  // ),
  [NewMeetingPhaseTypeEnum.lobby]: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingLobby' */ 'universal/components/ActionMeetingLobby')
  )
}

type PhaseComponent = ValueOf<typeof phaseLookup>

export interface ActionMeetingPhaseProps extends NewMeetingTypeProps {}

const ActionMeeting = (props: Props) => {
  const {viewer} = props
  const {team} = viewer
  const {handleGotoNext, gotoStageId, safeRoute} = useMeeting(MeetingTypeEnum.action, team)
  if (!team || !safeRoute) return null
  const {meetingSettings, newMeeting} = team
  const {phaseTypes} = meetingSettings
  const {localPhase} = newMeeting || UNSTARTED_MEETING
  const localPhaseType = (localPhase && localPhase.phaseType) || NewMeetingPhaseTypeEnum.lobby
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <NewMeeting
      viewer={viewer}
      gotoStageId={gotoStageId}
      meetingType={MeetingTypeEnum.action}
      phaseTypes={phaseTypes as ReadonlyArray<NewMeetingPhaseTypeEnum>}
    >
      <Phase handleGotoNext={handleGotoNext} team={team} />
    </NewMeeting>
  )
}

graphql`
  fragment ActionMeetingLocalStage on NewMeetingStage {
    id
    isComplete
    isNavigable
    isNavigableByFacilitator
  }
`

graphql`
  fragment ActionMeetingLocalPhase on NewMeetingPhase {
    id
    phaseType
    stages {
      ...ActionMeetingLocalStage @relay(mask: false)
    }
  }
`

graphql`
  fragment ActionMeetingTeam on Team {
    ...ActionMeetingLobby_team
    ...NewMeetingCheckIn_team
    id
    name
    meetingId
    newMeeting {
      id
      facilitatorStageId
      facilitatorUserId
      localPhase {
        ...ActionMeetingLocalPhase @relay(mask: false)
      }
      localStage {
        ...ActionMeetingLocalStage @relay(mask: false)
      }
      phases {
        ...ActionMeetingLocalPhase @relay(mask: false)
      }
    }
  }
`

export default createFragmentContainer(
  ActionMeeting,
  graphql`
    fragment ActionMeeting_viewer on User {
      ...NewMeeting_viewer
      team(teamId: $teamId) {
        meetingSettings(meetingType: action) {
          phaseTypes
        }
        ...ActionMeetingTeam @relay(mask: false)
      }
    }
  `
)
