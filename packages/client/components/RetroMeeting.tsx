import React, {ReactElement} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ValueOf} from '../types/generics'
import MeetingStyles from './MeetingStyles'
import RetroMeetingSidebar from './RetroMeetingSidebar'
import useAtmosphere from '../hooks/useAtmosphere'
import useMeeting from '../hooks/useMeeting'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import RejoinFacilitatorButton from '../modules/meeting/components/RejoinFacilitatorButton/RejoinFacilitatorButton'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import {RetroDemo} from '../types/constEnums'
import {RetroMeeting_meeting} from '__generated__/RetroMeeting_meeting.graphql'
import useGotoNext from '../hooks/useGotoNext'

interface Props {
  meeting: RetroMeeting_meeting
}

const phaseLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  [NewMeetingPhaseTypeEnum.reflect]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroReflectPhase' */ './RetroReflectPhase/RetroReflectPhase')
  ),
  [NewMeetingPhaseTypeEnum.group]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroGroupPhase' */ './RetroGroupPhase')
  ),
  [NewMeetingPhaseTypeEnum.vote]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroVotePhase' */ './RetroVotePhase')
  ),
  [NewMeetingPhaseTypeEnum.discuss]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroDiscussPhase' */ './RetroDiscussPhase')
  )
}

type PhaseComponent = ValueOf<typeof phaseLookup>

export interface RetroMeetingPhaseProps {
  handleGotoNext: ReturnType<typeof useGotoNext>
  isDemoStageComplete: boolean
  toggleSidebar: () => void
  meeting: any
  avatarGroup: ReactElement
}

const RetroMeeting = (props: Props) => {
  const {meeting} = props
  const {
    toggleSidebar,
    streams,
    swarm,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    handleMenuClick,
    demoPortal
  } = useMeeting(meeting)
  const atmosphere = useAtmosphere()
  if (!safeRoute) return null
  const {
    id: meetingId,
    showSidebar,
    viewerMeetingMember,
    facilitatorStageId,
    localPhase,
    localStage
  } = meeting
  const {user} = viewerMeetingMember
  const {featureFlags} = user
  const {video: allowVideo} = featureFlags
  const localPhaseType = localPhase?.phaseType
  const isDemoStageComplete =
    meetingId === RetroDemo.MEETING_ID
      ? ((atmosphere as unknown) as LocalAtmosphere).clientGraphQLServer.isBotFinished()
      : false
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <MeetingStyles>
      {demoPortal()}
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <RetroMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <Phase
        handleGotoNext={handleGotoNext}
        meeting={meeting}
        isDemoStageComplete={isDemoStageComplete}
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
      <RejoinFacilitatorButton
        inSync={localStage ? localStage.id === facilitatorStageId : true}
        onClick={() => gotoStageId(facilitatorStageId)}
      />
    </MeetingStyles>
  )
}

export default createFragmentContainer(RetroMeeting, {
  meeting: graphql`
    fragment RetroMeeting_meeting on RetrospectiveMeeting {
      ...useMeeting_meeting
      ...RetroMeetingSidebar_meeting
      ...NewMeetingCheckIn_meeting
      ...RetroReflectPhase_meeting
      ...RetroGroupPhase_meeting
      ...RetroVotePhase_meeting
      ...RetroDiscussPhase_meeting
      ...NewMeetingAvatarGroup_meeting
      id
      showSidebar
      facilitatorStageId
      localPhase {
        phaseType
      }
      localStage {
        id
      }
      phases {
        phaseType
        stages {
          id
        }
      }
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
