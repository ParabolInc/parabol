import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, Suspense, useEffect} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useSidebar from '~/hooks/useSidebar'
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
  const atmosphere = useAtmosphere()
  const {
    id: meetingId,
    isCommentUnread,
    isRightDrawerOpen,
    showSidebar,
    viewerMeetingMember,
    localPhase
  } = meeting
  const {isOpen: isDrawerInitiallyOpen} = useSidebar(showSidebar)

  const handleLocalUpdate = (isDrawerOpen: boolean) => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)!
      meeting.setValue(isDrawerOpen, 'isRightDrawerOpen')
      if (isDrawerOpen && isCommentUnread) {
        meeting.setValue(false, 'isCommentUnread')
      } else if (isCommentUnread === undefined) {
        meeting.setValue(false, 'isCommentUnread')
      }
    })
  }
  const toggleDrawer = () => handleLocalUpdate(!isRightDrawerOpen)
  useEffect(() => {
    handleLocalUpdate(isDrawerInitiallyOpen)
  }, [])

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
          meeting={meeting}
          toggleDrawer={toggleDrawer}
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
        isRightDrawerOpen={isRightDrawerOpen}
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
      isCommentUnread
      isRightDrawerOpen
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
