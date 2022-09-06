import styled from '@emotion/styled'
import {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {ActionMeetingAgendaItems_meeting} from '~/__generated__/ActionMeetingAgendaItems_meeting.graphql'
import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {Elevation} from '../styles/elevation'
import {Breakpoint, Card, DiscussionThreadEnum} from '../types/constEnums'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import Avatar from './Avatar/Avatar'
import {DiscussionThreadables, Header as DiscussionThreadHeader} from './DiscussionThreadList'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import PromptResponseEditor from './promptResponse/PromptResponseEditor'

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingAgendaItems_meeting
}

const AgendaVerbatim = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 auto'
})

const StyledHeading = styled(MeetingPhaseHeading)({
  marginLeft: 16,
  fontSize: 24
})

const DescriptionWrapper = styled('div')({
  marginTop: '16px',
  width: DiscussionThreadEnum.WIDTH,
  background: Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: Elevation.CARD_SHADOW,
  padding: Card.PADDING,
  outline: 'none',
  maxHeight: '33%',
  overflow: 'scroll'
})

const StyledCopy = styled(MeetingCopy)({
  margin: '16px 0 0'
})

const ThreadColumn = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  paddingTop: 4,
  paddingBottom: isDesktop ? 16 : 8,
  width: '100%',
  maxWidth: 700
}))

const ActionMeetingAgendaItems = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const {showSidebar, endedAt, localStage} = meeting
  const {agendaItem, discussionId} = localStage
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const meetingContentRef = useRef<HTMLDivElement>(null)
  const contentJSON: JSONContent | null = useMemo(
    () => (agendaItem?.descriptionContent ? JSON.parse(agendaItem.descriptionContent) : null),
    [agendaItem]
  )
  // optimistic updater could remove the agenda item
  if (!agendaItem) return null
  const {content, teamMember, descriptionContent} = agendaItem
  const {picture, preferredName} = teamMember
  const allowedThreadables: DiscussionThreadables[] = endedAt ? [] : ['comment', 'task', 'poll']
  return (
    <MeetingContent ref={meetingContentRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.agendaitems}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <AgendaVerbatim>
            <Avatar picture={picture} size={64} />
            <StyledHeading>{content}</StyledHeading>
          </AgendaVerbatim>
          {contentJSON && (
            <DescriptionWrapper>
              <PromptResponseEditor content={contentJSON} readOnly={true} />
            </DescriptionWrapper>
          )}
          <StyledCopy></StyledCopy>
          <ThreadColumn isDesktop={isDesktop}>
            <DiscussionThreadRoot
              meetingContentRef={meetingContentRef}
              discussionId={discussionId!}
              allowedThreadables={allowedThreadables}
              header={
                <DiscussionThreadHeader>{'Discussion & Takeaway Tasks'}</DiscussionThreadHeader>
              }
              emptyState={
                <DiscussionThreadListEmptyState
                  allowTasks={true}
                  isReadOnly={allowedThreadables.length === 0}
                />
              }
            />
          </ThreadColumn>
          <EditorHelpModalContainer />
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment ActionMeetingAgendaItemsStage on AgendaItemsStage {
    discussionId
    agendaItem {
      content
      descriptionContent
      teamMember {
        picture
        preferredName
      }
    }
  }
`

export default createFragmentContainer(ActionMeetingAgendaItems, {
  meeting: graphql`
    fragment ActionMeetingAgendaItems_meeting on ActionMeeting {
      showSidebar
      endedAt
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
  `
})
