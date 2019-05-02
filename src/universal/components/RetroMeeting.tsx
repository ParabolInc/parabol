import {RetroMeeting_viewer} from '__generated__/RetroMeeting_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {ValueOf} from 'types/generics'
import NewMeeting from 'universal/components/NewMeeting'
import useMeeting from 'universal/hooks/newMeeting'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {demoTeamId} from 'universal/modules/demo/initDB'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import lazyPreload from 'universal/utils/lazyPreload'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'

interface Props {
  viewer: RetroMeeting_viewer
}

const phaseLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingCheckIn' */ 'universal/components/NewMeetingCheckIn')
  ),
  [NewMeetingPhaseTypeEnum.reflect]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroReflectPhase' */ 'universal/components/RetroReflectPhase/RetroReflectPhase')
  ),
  [NewMeetingPhaseTypeEnum.group]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroGroupPhase' */ 'universal/components/RetroGroupPhase')
  ),
  [NewMeetingPhaseTypeEnum.vote]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroVotePhase' */ 'universal/components/RetroVotePhase')
  ),
  [NewMeetingPhaseTypeEnum.discuss]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroDiscussPhase' */ 'universal/components/RetroDiscussPhase')
  ),
  [NewMeetingPhaseTypeEnum.lobby]: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingLobby' */ 'universal/components/RetroLobby')
  )
}

type PhaseComponent = ValueOf<typeof phaseLookup>

const RetroMeeting = (props: Props) => {
  const {viewer} = props
  const {team} = viewer
  const {gotoNext, gotoNextRef, gotoStageId, safeRoute} = useMeeting(
    MeetingTypeEnum.retrospective,
    team
  )
  const atmosphere = useAtmosphere()
  if (!team || !safeRoute) return null
  const {id: teamId, newMeeting} = team
  const {localPhase} = newMeeting || UNSTARTED_MEETING
  const localPhaseType = (localPhase && localPhase.phaseType) || NewMeetingPhaseTypeEnum.lobby
  const isDemoStageComplete =
    teamId === demoTeamId
      ? ((atmosphere as unknown) as LocalAtmosphere).clientGraphQLServer.isBotFinished()
      : false
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <NewMeeting
      viewer={viewer}
      gotoStageId={gotoStageId}
      meetingType={MeetingTypeEnum.retrospective}
    >
      <Phase
        gotoNext={gotoNext}
        gotoNextRef={gotoNextRef}
        team={team}
        isDemoStageComplete={isDemoStageComplete}
      />
    </NewMeeting>
  )
}

graphql`
  fragment RetroMeetingLocalPhase on NewMeetingPhase {
    id
    phaseType
    stages {
      ...RetroMeetingLocalStage @relay(mask: false)
    }
  }
`
graphql`
  fragment RetroMeetingLocalStage on NewMeetingStage {
    id
    isComplete
    isNavigable
    isNavigableByFacilitator
  }
`

export default createFragmentContainer(
  RetroMeeting,
  graphql`
    fragment RetroMeeting_viewer on User {
      ...NewMeeting_viewer
      team(teamId: $teamId) {
        ...RetroLobby_team
        ...NewMeetingCheckIn_team
        ...RetroReflectPhase_team
        ...RetroGroupPhase_team
        ...RetroVotePhase_team
        ...RetroDiscussPhase_team
        id
        name
        meetingId
        newMeeting {
          id
          facilitatorStageId
          facilitatorUserId
          localPhase {
            ...RetroMeetingLocalPhase @relay(mask: false)
          }
          localStage {
            ...RetroMeetingLocalStage @relay(mask: false)
          }
          phases {
            ...RetroMeetingLocalPhase @relay(mask: false)
          }
        }
      }
    }
  `
)
