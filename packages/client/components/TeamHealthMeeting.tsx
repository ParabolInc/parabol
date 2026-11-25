import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthMeeting_meeting$key} from '~/__generated__/TeamHealthMeeting_meeting.graphql'
import useMeeting from '../hooks/useMeeting'
import useRightDrawer from '../hooks/useRightDrawer'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import MeetingLockedOverlay from './MeetingLockedOverlay'
import MeetingStyles from './MeetingStyles'
import MeetingTopBar from './MeetingTopBar'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import getTeamHealthDiscussionId from './TeamHealth/getTeamHealthDiscussionId'
import TeamHealthDiscussionDrawer from './TeamHealth/TeamHealthDiscussionDrawer'
import TeamHealthPhaseContent from './TeamHealth/TeamHealthPhaseContent'
import TeamHealthMeetingSidebar from './TeamHealthMeetingSidebar'

interface Props {
  meeting: TeamHealthMeeting_meeting$key
}

const TeamHealthMeeting = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthMeeting_meeting on TeamHealthMeeting {
        ...useMeeting_meeting
        ...MeetingLockedOverlay_meeting
        ...TeamHealthMeetingSidebar_meeting
        ...TeamHealthPhaseContent_meeting
        ...TeamHealthDiscussionDrawer_meeting
        ...NewMeetingAvatarGroup_meeting
        ...getTeamHealthDiscussionId_meeting
        id
        showSidebar
        rightDrawerOpen
      }
    `,
    meetingRef
  )
  const {gotoStageId, safeRoute, toggleSidebar, handleMenuClick} = useMeeting(meeting)
  const [toggleDrawer] = useRightDrawer(meeting.id)
  if (!safeRoute) return null
  const {showSidebar, rightDrawerOpen} = meeting
  const discussionId = getTeamHealthDiscussionId(meeting)
  return (
    <MeetingStyles>
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <TeamHealthMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <div className='flex h-full min-w-0 flex-1 flex-col overflow-auto'>
        <MeetingTopBar
          avatarGroup={<NewMeetingAvatarGroup meetingRef={meeting} />}
          isMeetingSidebarCollapsed={!showSidebar}
          rightDrawerOpen={rightDrawerOpen}
          toggleDrawer={discussionId ? toggleDrawer : undefined}
          toggleSidebar={toggleSidebar}
        />
        <div className='min-h-0 flex-1'>
          <TeamHealthPhaseContent meeting={meeting} gotoStageId={gotoStageId} />
        </div>
      </div>
      {discussionId && (
        <TeamHealthDiscussionDrawer
          meeting={meeting}
          discussionId={discussionId}
          toggleDrawer={toggleDrawer}
        />
      )}
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default TeamHealthMeeting
