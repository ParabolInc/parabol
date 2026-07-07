import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroVotePhase_meeting$key} from '~/__generated__/RetroVotePhase_meeting.graphql'
import useCallbackRef from '../hooks/useCallbackRef'
import useRightDrawer from '../hooks/useRightDrawer'
import {DiscussionThreadEnum} from '../types/constEnums'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import DiscussionDrawer from './DiscussionDrawer'
import GroupingKanban from './GroupingKanban'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import type {RetroMeetingPhaseProps} from './RetroMeeting'
import RetroVoteMetaHeader from './RetroVoteMetaHeader'
import StageTimerDisplay from './StageTimerDisplay'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroVotePhase_meeting$key
}

const RetroVotePhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroVotePhase_meeting on RetrospectiveMeeting {
        ...StageTimerControl_meeting
        ...StageTimerDisplay_meeting
        ...GroupingKanban_meeting
        ...RetroVoteMetaHeader_meeting
        ...DiscussionDrawerTranscripts_meeting
        id
        endedAt
        showSidebar
        rightDrawerOpen
      }
    `,
    meetingRef
  )
  const [callbackRef, phaseRef] = useCallbackRef()
  const {id: meetingId, endedAt, showSidebar, rightDrawerOpen} = meeting
  const [toggleDrawer, setActiveTab] = useRightDrawer(meetingId, 'transcription', false)

  return (
    <MeetingContent ref={callbackRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          rightDrawerOpen={rightDrawerOpen}
          drawerType='transcription'
          toggleSidebar={toggleSidebar}
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.vote}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Vote on the topics you want to discuss'}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <RetroVoteMetaHeader meeting={meeting} />
          <StageTimerDisplay meeting={meeting} />
          <MeetingPhaseWrapper>
            <GroupingKanban meeting={meeting} phaseRef={phaseRef} />
          </MeetingPhaseWrapper>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
      <ResponsiveDashSidebar
        isOpen={rightDrawerOpen != null}
        isRightDrawer
        onToggle={toggleDrawer}
        sidebarWidth={DiscussionThreadEnum.WIDTH}
      >
        <DiscussionDrawer
          hideDiscussion
          onToggle={toggleDrawer}
          allowedThreadables={[]}
          meetingRef={meeting}
          meetingId={meetingId}
          activeTab={rightDrawerOpen}
          onChangeTab={setActiveTab}
        />
      </ResponsiveDashSidebar>
    </MeetingContent>
  )
}

export default RetroVotePhase
