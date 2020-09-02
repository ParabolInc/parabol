import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RetroMeeting_meeting} from '~/__generated__/RetroMeeting_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMeeting from '../hooks/useMeeting'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {RetroDemo} from '../types/constEnums'
import {ValueOf} from '../types/generics'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import MeetingControlBar from './MeetingControlBar'
import MeetingStyles from './MeetingStyles'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroMeetingSidebar from './RetroMeetingSidebar'

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
  toggleSidebar: () => void
  meeting: any
  avatarGroup: ReactElement
}

const RetroMeeting = (props: Props) => {
  const {meeting} = props
  const {
    toggleSidebar,
    peers,
    producers,
    consumers,
    mediaRoom,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    handleMenuClick,
    demoPortal
  } = useMeeting(meeting)
  const atmosphere = useAtmosphere()
  if (!safeRoute) return null
  const {id: meetingId, showSidebar, viewerMeetingMember, localPhase} = meeting
  const {user} = viewerMeetingMember
  const {featureFlags} = user
  const {video: allowVideo} = featureFlags
  const localPhaseType = localPhase?.phaseType

  const Phase = phaseLookup[localPhaseType] as PhaseComponent

  const isDemoStageComplete =
    meetingId === RetroDemo.MEETING_ID
      ? ((atmosphere as unknown) as LocalAtmosphere).clientGraphQLServer.isBotFinished()
      : false
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
      <Suspense fallback={''}>
        <Phase
          meeting={meeting}
          toggleSidebar={toggleSidebar}
          avatarGroup={
            <NewMeetingAvatarGroup
              allowVideo={allowVideo}
              peers={peers}
              producers={producers}
              consumers={consumers}
              mediaRoom={mediaRoom}
              meeting={meeting}
            />
          }
        />
      </Suspense>
      <MeetingControlBar
        isDemoStageComplete={isDemoStageComplete}
        meeting={meeting}
        handleGotoNext={handleGotoNext}
        gotoStageId={gotoStageId}
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
      ...MeetingControlBar_meeting
      id
      showSidebar
      localPhase {
        phaseType
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
