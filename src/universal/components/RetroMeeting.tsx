import {RetroMeeting_viewer} from '__generated__/RetroMeeting_viewer.graphql'
import React, {ReactElement} from 'react'
import {DragDropContext as dragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {createFragmentContainer, graphql} from 'react-relay'
import {ValueOf} from 'types/generics'
import LayoutPusher from 'universal/components/LayoutPusher'
import MeetingArea from 'universal/components/MeetingArea'
import MeetingStyles from 'universal/components/MeetingStyles'
import RetroMeetingSidebar from 'universal/components/RetroMeetingSidebar'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMeeting, {useGotoNext} from 'universal/hooks/useMeeting'
import {demoTeamId} from 'universal/modules/demo/initDB'
import NewMeetingAvatarGroup from 'universal/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import RejoinFacilitatorButton from 'universal/modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton'
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

export interface RetroMeetingPhaseProps {
  handleGotoNext: ReturnType<typeof useGotoNext>
  isDemoStageComplete: boolean
  meetingSettings: any
  team: any
  toggleSidebar: () => void
  avatarGroup: ReactElement
}

const RetroMeeting = (props: Props) => {
  const {viewer} = props
  const team = viewer.team!
  const {toggleSidebar, streams, swarm, handleGotoNext, gotoStageId, safeRoute} = useMeeting(
    MeetingTypeEnum.retrospective,
    team
  )
  const atmosphere = useAtmosphere()
  if (!team || !safeRoute) return null
  const {featureFlags} = viewer
  const {video: allowVideo} = featureFlags
  const {id: teamId, meetingSettings, isMeetingSidebarCollapsed, newMeeting} = team
  const {facilitatorStageId, localPhase, localStage} = newMeeting || UNSTARTED_MEETING
  const localPhaseType = (localPhase && localPhase.phaseType) || NewMeetingPhaseTypeEnum.lobby
  const isDemoStageComplete =
    teamId === demoTeamId
      ? ((atmosphere as unknown) as LocalAtmosphere).clientGraphQLServer.isBotFinished()
      : false
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <MeetingStyles>
      <RetroMeetingSidebar
        gotoStageId={gotoStageId}
        toggleSidebar={toggleSidebar}
        viewer={viewer}
      />
      <MeetingArea>
        <LayoutPusher isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed} />
        <Phase
          handleGotoNext={handleGotoNext}
          meetingSettings={meetingSettings}
          team={team}
          isDemoStageComplete={isDemoStageComplete}
          toggleSidebar={toggleSidebar}
          avatarGroup={
            <NewMeetingAvatarGroup
              allowVideo={allowVideo}
              swarm={swarm}
              gotoStageId={gotoStageId}
              team={team}
              camStreams={streams.cam}
            />
          }
        />
      </MeetingArea>
      <RejoinFacilitatorButton
        inSync={localStage ? localStage.id === facilitatorStageId : true}
        onClick={() => gotoStageId(facilitatorStageId)}
      />
    </MeetingStyles>
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
graphql`
  fragment RetroMeetingTeam on Team {
    ...RetroLobby_team
    ...NewMeetingCheckIn_team
    ...RetroReflectPhase_team
    ...RetroGroupPhase_team
    ...RetroVotePhase_team
    ...RetroDiscussPhase_team
    ...useMeetingTeam @relay(mask: false)
    id
    isMeetingSidebarCollapsed
    newMeeting {
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
`

export default createFragmentContainer(
  dragDropContext(HTML5Backend)(RetroMeeting),
  graphql`
    fragment RetroMeeting_viewer on User {
      ...RetroMeetingSidebar_viewer
      featureFlags {
        video
      }
      team(teamId: $teamId) {
        ...NewMeetingAvatarGroup_team
        ...RetroMeetingTeam @relay(mask: false)
        meetingSettings(meetingType: retrospective) {
          ...RetroLobby_meetingSettings
          ...RetroVotePhase_meetingSettings
        }
      }
    }
  `
)
