import {ActionMeeting_viewer} from '../__generated__/ActionMeeting_viewer.graphql'
import React, {ReactElement, useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ValueOf} from '../types/generics'
import ActionMeetingSidebar from './ActionMeetingSidebar'
import MeetingArea from './MeetingArea'
import MeetingStyles from './MeetingStyles'
import useMeeting, {useGotoNext} from '../hooks/useMeeting'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import RejoinFacilitatorButton from '../modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import UNSTARTED_MEETING from '../utils/meetings/unstartedMeeting'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'

interface Props {
  viewer: ActionMeeting_viewer
}

const phaseLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  [NewMeetingPhaseTypeEnum.updates]: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingUpdates' */ './ActionMeetingUpdates')
  ),
  [NewMeetingPhaseTypeEnum.firstcall]: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingFirstCall' */ './ActionMeetingFirstCall')
  ),
  [NewMeetingPhaseTypeEnum.agendaitems]: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingAgendaItems' */ './ActionMeetingAgendaItems')
  ),
  [NewMeetingPhaseTypeEnum.lastcall]: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingLastCall' */ './ActionMeetingLastCall')
  ),
  [NewMeetingPhaseTypeEnum.lobby]: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingLobby' */ './ActionMeetingLobby')
  )
}

type PhaseComponent = ValueOf<typeof phaseLookup>

export interface ActionMeetingPhaseProps {
  avatarGroup: ReactElement
  handleGotoNext: ReturnType<typeof useGotoNext>
  toggleSidebar: () => void
}

const ActionMeeting = (props: Props) => {
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
  } = useMeeting(MeetingTypeEnum.action, team)
  useEffect(() => {
    Object.values(phaseLookup).forEach((lazy) => lazy.preload())
  }, [])
  if (!team || !safeRoute) return null
  const {featureFlags} = viewer
  const {video: allowVideo} = featureFlags
  const {newMeeting, isMeetingSidebarCollapsed} = team
  const {facilitatorStageId, localPhase, localStage} = newMeeting || UNSTARTED_MEETING
  const localPhaseType = (localPhase && localPhase.phaseType) || NewMeetingPhaseTypeEnum.lobby
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <MeetingStyles>
      <ResponsiveDashSidebar isOpen={!isMeetingSidebarCollapsed} onToggle={toggleSidebar}>
        <ActionMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          viewer={viewer}
        />
      </ResponsiveDashSidebar>
      <MeetingArea>
        <Phase
          handleGotoNext={handleGotoNext}
          team={team}
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
    ...ActionMeetingUpdates_team
    ...ActionMeetingFirstCall_team
    ...ActionMeetingAgendaItems_team
    ...ActionMeetingLastCall_team
    ...NewMeetingCheckIn_team
    ...useMeetingTeam @relay(mask: false)
    isMeetingSidebarCollapsed
    newMeeting {
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

export default createFragmentContainer(ActionMeeting, {
  viewer: graphql`
    fragment ActionMeeting_viewer on User {
      ...ActionMeetingSidebar_viewer
      featureFlags {
        video
      }
      team(teamId: $teamId) {
        ...NewMeetingAvatarGroup_team
        ...ActionMeetingTeam @relay(mask: false)
      }
    }
  `
})
