import {RetroMeeting_viewer} from '../__generated__/RetroMeeting_viewer.graphql'
import React, {ReactElement} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {ValueOf} from '../types/generics'
import MeetingArea from './MeetingArea'
import MeetingStyles from './MeetingStyles'
import RetroMeetingSidebar from './RetroMeetingSidebar'
import useAtmosphere from '../hooks/useAtmosphere'
import useMeeting, {useGotoNext} from '../hooks/useMeeting'
import {demoTeamId} from '../modules/demo/initDB'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import RejoinFacilitatorButton from '../modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'

interface Props {
  viewer: RetroMeeting_viewer
}

const phaseLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  [NewMeetingPhaseTypeEnum.reflect]: lazyPreload(() =>
    import(
      /* webpackChunkName: 'RetroReflectPhase' */ './RetroReflectPhase/RetroReflectPhase'
    )
  ),
  [NewMeetingPhaseTypeEnum.group]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroGroupPhase' */ './RetroGroupPhase')
  ),
  [NewMeetingPhaseTypeEnum.vote]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroVotePhase' */ './RetroVotePhase')
  ),
  [NewMeetingPhaseTypeEnum.discuss]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroDiscussPhase' */ './RetroDiscussPhase')
  ),
  [NewMeetingPhaseTypeEnum.lobby]: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingLobby' */ './RetroLobby')
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
  const {
    toggleSidebar,
    streams,
    swarm,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    handleMenuClick
  } = useMeeting(MeetingTypeEnum.retrospective, team)
  const atmosphere = useAtmosphere()
  if (!team || !safeRoute) return null
  const {featureFlags} = viewer
  const {video: allowVideo} = featureFlags
  const {id: teamId, meetingSettings, newMeeting, isMeetingSidebarCollapsed} = team
  const {facilitatorStageId, localPhase, localStage} = newMeeting || UNSTARTED_MEETING
  const localPhaseType = (localPhase && localPhase.phaseType) || NewMeetingPhaseTypeEnum.lobby
  const isDemoStageComplete =
    teamId === demoTeamId
      ? ((atmosphere as unknown) as LocalAtmosphere).clientGraphQLServer.isBotFinished()
      : false
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <MeetingStyles>
      <ResponsiveDashSidebar isOpen={!isMeetingSidebarCollapsed} onToggle={toggleSidebar}>
        <RetroMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          viewer={viewer}
        />
      </ResponsiveDashSidebar>
      <MeetingArea>
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

export default createFragmentContainer(RetroMeeting, {
  viewer: graphql`
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
})
