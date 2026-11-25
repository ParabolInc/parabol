import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroMeetingDrawer_meeting$key} from '~/__generated__/RetroMeetingDrawer_meeting.graphql'
import type useGotoStageId from '~/hooks/useGotoStageId'
import useRightDrawer from '~/hooks/useRightDrawer'
import {DiscussionThreadEnum} from '../types/constEnums'
import DiscussionDrawer from './DiscussionDrawer'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroMeetingSettings from './RetroMeetingSettings/RetroMeetingSettings'
import RetroSettingsSubviews from './RetroMeetingSettings/RetroSettingsSubviews'
import RetroWorkDrawer from './TeamPrompt/WorkDrawer/RetroWorkDrawer'

interface Props {
  meeting: RetroMeetingDrawer_meeting$key
  showInspiration: boolean
  gotoStageId: ReturnType<typeof useGotoStageId>
  // the thread of the Team Health check's stage the viewer is on, if any
  discussionId?: string
  // the thread is the check's, so only its members write in it
  canComment?: boolean
}

const RetroMeetingDrawer = (props: Props) => {
  const {meeting: meetingRef, showInspiration, gotoStageId, discussionId, canComment} = props
  const meeting = useFragment(
    graphql`
      fragment RetroMeetingDrawer_meeting on RetrospectiveMeeting {
        ...DiscussionDrawerTranscripts_meeting
        ...RetroWorkDrawer_meeting
        ...RetroMeetingSettings_meeting
        ...RetroSettingsSubviews_meeting
        id
        rightDrawerOpen
      }
    `,
    meetingRef
  )
  const {id: meetingId, rightDrawerOpen} = meeting
  const [toggleDrawer, setActiveTab] = useRightDrawer(
    meetingId,
    showInspiration ? 'inspiration' : discussionId ? 'discussion' : 'settings',
    false
  )
  return (
    <ResponsiveDashSidebar
      isOpen={rightDrawerOpen != null}
      isRightDrawer
      onToggle={toggleDrawer}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <RetroSettingsSubviews
        meetingRef={meeting}
        activeTab={rightDrawerOpen}
        onChangeTab={setActiveTab}
        onClose={toggleDrawer}
      >
        <DiscussionDrawer
          hideDiscussion={!discussionId}
          discussionId={discussionId}
          onToggle={toggleDrawer}
          allowedThreadables={discussionId && canComment ? ['comment', 'task', 'poll'] : []}
          autoFocus={false}
          meetingRef={meeting}
          meetingId={meetingId}
          workContent={showInspiration ? <RetroWorkDrawer meetingRef={meeting} /> : undefined}
          settingsContent={
            <RetroMeetingSettings
              meetingRef={meeting}
              onOpenSubview={setActiveTab}
              gotoStageId={gotoStageId}
            />
          }
          activeTab={rightDrawerOpen}
          onChangeTab={setActiveTab}
        />
      </RetroSettingsSubviews>
    </ResponsiveDashSidebar>
  )
}

export default RetroMeetingDrawer
