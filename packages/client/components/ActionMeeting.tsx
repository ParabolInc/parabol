import React, {ReactElement, useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ValueOf} from '../types/generics'
import ActionMeetingSidebar from './ActionMeetingSidebar'
import MeetingArea from './MeetingArea'
import MeetingStyles from './MeetingStyles'
import useMeeting from '../hooks/useMeeting'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import RejoinFacilitatorButton from '../modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import {ActionMeeting_meeting} from '__generated__/ActionMeeting_meeting.graphql'
import useGotoNext from '../hooks/useGotoNext'

interface Props {
  meeting: ActionMeeting_meeting
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
  )
}

type PhaseComponent = ValueOf<typeof phaseLookup>

export interface ActionMeetingPhaseProps {
  avatarGroup: ReactElement
  handleGotoNext: ReturnType<typeof useGotoNext>
  toggleSidebar: () => void
}

const ActionMeeting = (props: Props) => {
  const {meeting} = props
  const {facilitatorStageId, localPhase, localStage, showSidebar, viewerMeetingMember} = meeting
  const {
    toggleSidebar,
    streams,
    swarm,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    handleMenuClick
  } = useMeeting(meeting)
  useEffect(() => {
    Object.values(phaseLookup).forEach((lazy) => lazy.preload())
  }, [])
  if (!safeRoute) return null
  const {user} = viewerMeetingMember
  const {featureFlags} = user
  const {video: allowVideo} = featureFlags
  const localPhaseType = (localPhase && localPhase.phaseType) || NewMeetingPhaseTypeEnum.lobby
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <MeetingStyles>
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <ActionMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <MeetingArea>
        <Phase
          handleGotoNext={handleGotoNext}
          meeting={meeting}
          toggleSidebar={toggleSidebar}
          avatarGroup={
            <NewMeetingAvatarGroup
              allowVideo={allowVideo}
              camStreams={streams.cam}
              swarm={swarm}
              meeting={meeting}
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

export default createFragmentContainer(ActionMeeting, {
  meeting: graphql`
    fragment ActionMeeting_meeting on ActionMeeting {
      ...useMeeting_meeting
      ...ActionMeetingSidebar_meeting
      ...NewMeetingCheckIn_meeting
      ...ActionMeetingUpdates_meeting
      ...ActionMeetingFirstCall_meeting
      ...ActionMeetingAgendaItems_meeting
      ...ActionMeetingLastCall_meeting
      ...NewMeetingAvatarGroup_meeting
      localPhase {
        id
        phaseType
      }
      localStage {
        id
      }
      phases {
        id
        phaseType
        stages {
          id
        }
      }
      facilitatorStageId
      showSidebar
      viewerMeetingMember {
        user {
          featureFlags {
            video
          }
        }
      }
    }
  `
})
