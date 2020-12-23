import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, Suspense} from 'react'
import { createFragmentContainer} from 'react-relay'
import {PokerMeeting_meeting} from '~/__generated__/PokerMeeting_meeting.graphql'
import useMeeting from '../hooks/useMeeting'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {ValueOf} from '../types/generics'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import MeetingControlBar from './MeetingControlBar'
import MeetingStyles from './MeetingStyles'
import PokerMeetingSidebar from './PokerMeetingSidebar'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'

interface Props {
  meeting: PokerMeeting_meeting
}

const phaseLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: lazyPreload(
    () => import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  SCOPE: lazyPreload(() => import(/* webpackChunkName: 'ScopePhase' */ './ScopePhase')),
  ESTIMATE: lazyPreload(
    () => import(/* webpackChunkName: 'PokerEstimatePhase' */ './PokerEstimatePhase')
  )
}

type PhaseComponent = ValueOf<typeof phaseLookup>

export interface PokerMeetingPhaseProps {
  toggleSidebar: () => void
  meeting: any
  avatarGroup: ReactElement
}

const PokerMeeting = (props: Props) => {
  const {meeting} = props
  const {
    toggleSidebar,
    room,
    peers,
    producers,
    consumers,
    mediaRoom,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    handleMenuClick
  } = useMeeting(meeting)
  const {
    showSidebar,
    viewerMeetingMember,
    localPhase
  } = meeting

  if (!safeRoute) return null
  const {user} = viewerMeetingMember
  const {featureFlags} = user
  const {video: allowVideo} = featureFlags
  const localPhaseType = localPhase?.phaseType
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <MeetingStyles>
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <PokerMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <Suspense fallback={''}>
        <Phase
          gotoStageId={gotoStageId}
          meeting={meeting}
          toggleSidebar={toggleSidebar}
          avatarGroup={
            <NewMeetingAvatarGroup
              allowVideo={allowVideo}
              room={room}
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
        meeting={meeting}
        handleGotoNext={handleGotoNext}
        gotoStageId={gotoStageId}
      />
    </MeetingStyles>
  )
}

export default createFragmentContainer(PokerMeeting, {
  meeting: graphql`
    fragment PokerMeeting_meeting on PokerMeeting {
      ...useMeeting_meeting
      ...PokerMeetingSidebar_meeting
      ...NewMeetingCheckIn_meeting
      ...NewMeetingAvatarGroup_meeting
      ...MeetingControlBar_meeting
      ...ScopePhase_meeting
      ...PokerEstimatePhase_meeting
      id
      # hack to initialize local state (clientField needs to be on non-id domain state. thx relay)
      init: id @__clientField(handle: "localPoker")
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          id
        }
      }
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
