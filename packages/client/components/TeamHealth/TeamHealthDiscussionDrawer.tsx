import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthDiscussionDrawer_meeting$key} from '~/__generated__/TeamHealthDiscussionDrawer_meeting.graphql'
import {DiscussionThreadEnum} from '../../types/constEnums'
import DiscussionDrawer from '../DiscussionDrawer'
import type {DiscussionThreadables} from '../DiscussionThreadList'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'

interface Props {
  meeting: TeamHealthDiscussionDrawer_meeting$key
  discussionId: string
  toggleDrawer: () => void
}

// each question gets one discussion, shared by its response stage and its result stage, so the
// thread the team starts while answering is still there when the results are revealed. Unlike a
// retro, revealing the results is what ends the meeting, so the thread stays open afterwards:
// that is when the team actually discusses them
const TeamHealthDiscussionDrawer = (props: Props) => {
  const {meeting: meetingRef, discussionId, toggleDrawer} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthDiscussionDrawer_meeting on TeamHealthMeeting {
        ...DiscussionDrawerTranscripts_meeting
        id
        rightDrawerOpen
      }
    `,
    meetingRef
  )
  const {id: meetingId, rightDrawerOpen} = meeting
  const allowedThreadables: DiscussionThreadables[] = ['comment', 'task', 'poll']
  return (
    <ResponsiveDashSidebar
      isOpen={rightDrawerOpen != null}
      isRightDrawer
      onToggle={toggleDrawer}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <DiscussionDrawer
        discussionId={discussionId}
        onToggle={toggleDrawer}
        allowedThreadables={allowedThreadables}
        meetingRef={meeting}
        meetingId={meetingId}
        autoFocus={false}
      />
    </ResponsiveDashSidebar>
  )
}

export default TeamHealthDiscussionDrawer
