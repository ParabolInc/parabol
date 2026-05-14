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
import ActionMeetingAgendaItemsDiscussionDrawer from './ActionMeetingAgendaItemsDiscussionDrawer'
import Avatar from './Avatar/Avatar'
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

const StyledCopy = styled(MeetingCopy)({
  margin: '16px 0 0'
})

const ActionMeetingAgendaItems = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ActionMeetingAgendaItems_meeting on ActionMeeting {
        ...StageTimerDisplay_meeting
        ...StageTimerControl_meeting
        ...ActionMeetingAgendaItemsDiscussionDrawer_meeting
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
  const {agendaItem} = localStage
  const toggleDrawer = useRightDrawer(meetingId)
  // optimistic updater could remove the agenda item
  if (!agendaItem) return null
  const {content, teamMember} = agendaItem
  const {user} = teamMember
  const {picture, preferredName} = user

  const headerAndPhaseWidth = isRightDrawerOpen
    ? `w-[calc(100%_-_${DiscussionThreadEnum.WIDTH}px)] poker-discussion-fullscreen-drawer:w-full`
    : 'w-full'

  return (
    <MeetingContent>
      <MeetingHeaderAndPhase className={headerAndPhaseWidth} hideBottomBar={!!endedAt}>
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
          <StyledCopy>{`${preferredName}, what do you need?`}</StyledCopy>
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
        <ActionMeetingAgendaItemsDiscussionDrawer
          isOpen={isRightDrawerOpen}
          meeting={meeting}
          onToggle={toggleDrawer}
        />
      </ResponsiveDashSidebar>
    </MeetingContent>
  )
}

graphql`
  fragment ActionMeetingAgendaItemsStage on AgendaItemsStage {
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
