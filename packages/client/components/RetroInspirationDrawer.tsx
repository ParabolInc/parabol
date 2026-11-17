import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroInspirationDrawer_meeting$key} from '~/__generated__/RetroInspirationDrawer_meeting.graphql'
import useRightDrawer from '~/hooks/useRightDrawer'
import {DiscussionThreadEnum} from '../types/constEnums'
import DiscussionDrawer from './DiscussionDrawer'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroWorkDrawer from './TeamPrompt/WorkDrawer/RetroWorkDrawer'

interface Props {
  meeting: RetroInspirationDrawer_meeting$key
}

// Shared inspiration drawer for the reflect & group phases. Rendered once by RetroMeeting so it
// stays mounted across the reflect <-> group transition instead of flickering (unmount/remount)
// when the phase component itself is swapped out.
const RetroInspirationDrawer = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroInspirationDrawer_meeting on RetrospectiveMeeting {
        ...DiscussionDrawerTranscripts_meeting
        ...RetroWorkDrawer_meeting
        id
        rightDrawerOpen
      }
    `,
    meetingRef
  )
  const {id: meetingId, rightDrawerOpen} = meeting
  const [toggleDrawer, setActiveTab] = useRightDrawer(meetingId, 'inspiration', false)
  return (
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
        workContent={<RetroWorkDrawer meetingRef={meeting} />}
        activeTab={rightDrawerOpen}
        onChangeTab={setActiveTab}
      />
    </ResponsiveDashSidebar>
  )
}

export default RetroInspirationDrawer
