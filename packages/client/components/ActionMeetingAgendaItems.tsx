import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ActionMeetingAgendaItems_meeting$key} from '~/__generated__/ActionMeetingAgendaItems_meeting.graphql'
import useRightDrawer from '~/hooks/useRightDrawer'
import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {DiscussionThreadEnum} from '../types/constEnums'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import type {ActionMeetingPhaseProps} from './ActionMeeting'
import Avatar from './Avatar/Avatar'
import DiscussionDrawer from './DiscussionDrawer'
import type {DiscussionThreadables} from './DiscussionThreadList'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import StageTimerDisplay from './StageTimerDisplay'

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingAgendaItems_meeting$key
}

const StyledHeading = styled(MeetingPhaseHeading)({
  marginLeft: 16,
  fontSize: 24
})

const ActionMeetingAgendaItems = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ActionMeetingAgendaItems_meeting on ActionMeeting {
        ...StageTimerDisplay_meeting
        ...StageTimerControl_meeting
        ...DiscussionDrawerTranscripts_meeting
        id
        showSidebar
        endedAt
        isCommentUnread
        isRightDrawerOpen
        facilitatorUserId
        phases {
          stages {
            ...ActionMeetingAgendaItemsStage @relay(mask: false)
          }
        }
        localStage {
          ...ActionMeetingAgendaItemsStage @relay(mask: false)
        }
      }
    `,
    meetingRef
  )
  const {
    id: meetingId,
    showSidebar,
    endedAt,
    localStage,
    isCommentUnread,
    isRightDrawerOpen
  } = meeting
  const {agendaItem, discussionId} = localStage
  const toggleDrawer = useRightDrawer(meetingId)
  // optimistic updater could remove the agenda item
  if (!agendaItem) return null
  const {content, teamMember} = agendaItem
  const {user} = teamMember
  const {picture, preferredName} = user
  const allowedThreadables: DiscussionThreadables[] = endedAt ? [] : ['comment', 'task', 'poll']

  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isCommentUnread={isCommentUnread}
          isMeetingSidebarCollapsed={!showSidebar}
          isRightDrawerOpen={isRightDrawerOpen}
          toggleSidebar={toggleSidebar}
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.agendaitems}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <div className='mx-auto flex items-center'>
            <Avatar picture={picture} className={'h-16 w-16'} />
            <StyledHeading>{content}</StyledHeading>
          </div>
          <MeetingCopy className='mt-4 mb-0'>{`${preferredName}, what do you need?`}</MeetingCopy>
          <StageTimerDisplay meeting={meeting} />
          <EditorHelpModalContainer />
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
      <ResponsiveDashSidebar
        isOpen={isRightDrawerOpen}
        isRightDrawer
        onToggle={toggleDrawer}
        sidebarWidth={DiscussionThreadEnum.WIDTH}
      >
        <DiscussionDrawer
          discussionId={discussionId!}
          onToggle={toggleDrawer}
          allowedThreadables={allowedThreadables}
          meetingRef={meeting}
        />
      </ResponsiveDashSidebar>
    </MeetingContent>
  )
}

graphql`
  fragment ActionMeetingAgendaItemsStage on AgendaItemsStage {
    discussionId
    agendaItem {
      content
      teamMember {
        user {
          picture
          preferredName
        }
      }
    }
  }
`

export default ActionMeetingAgendaItems
