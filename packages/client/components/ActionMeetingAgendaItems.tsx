import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ActionMeetingAgendaItems_meeting} from '~/__generated__/ActionMeetingAgendaItems_meeting.graphql'
import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import MeetingAgendaCards from '../modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import Avatar from './Avatar/Avatar'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'

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

const StyledCopy = styled(MeetingCopy)({
  margin: '16px 0 0'
})

const TaskCardBlock = styled('div')({
  display: 'flex',
  flex: 1,
  margin: '0 auto',
  position: 'relative',
  width: '100%'
})

const Inner = styled('div')({
  display: 'flex',
  overflow: 'auto',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
})

const Inception = styled('div')({
  flex: 1,
  margin: '0 auto',
  maxWidth: 296 * 4 + 16 * 5,
  height: '100%',
  padding: 16
})

const ActionMeetingAgendaItems = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const {showSidebar, team, id: meetingId, endedAt, localStage} = meeting
  const {id: teamId, agendaItems, tasks} = team
  const {agendaItemId} = localStage
  const agendaTasks = useMemo(() => {
    return tasks.edges
      .map(({node}) => node)
      .filter((node) => node.threadId === agendaItemId)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
  }, [agendaItemId, tasks])
  const agendaItem = agendaItems.find((item) => item.id === agendaItemId!)
  // optimistic updater could remove the agenda item
  if (!agendaItem) return null
  const {content, teamMember} = agendaItem
  const {picture, preferredName} = teamMember
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>
            {phaseLabelLookup[NewMeetingPhaseTypeEnum.agendaitems]}
          </PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <AgendaVerbatim>
            <Avatar picture={picture} size={64} />
            <StyledHeading>{content}</StyledHeading>
          </AgendaVerbatim>
          <StyledCopy>{`${preferredName}, what do you need?`}</StyledCopy>
          <TaskCardBlock>
            <Inner>
              <Inception>
                <MeetingAgendaCards
                  agendaId={agendaItem.id}
                  maxCols={4}
                  meetingId={meetingId}
                  showPlaceholders
                  tasks={agendaTasks}
                  teamId={teamId}
                />
              </Inception>
            </Inner>
          </TaskCardBlock>
          <EditorHelpModalContainer />
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment ActionMeetingAgendaItemsStage on AgendaItemsStage {
    agendaItemId
  }
`

export default createFragmentContainer(ActionMeetingAgendaItems, {
  meeting: graphql`
    fragment ActionMeetingAgendaItems_meeting on ActionMeeting {
      id
      showSidebar
      endedAt
      facilitatorUserId
      localStage {
        ...ActionMeetingAgendaItemsStage @relay(mask: false)
      }
      phases {
        stages {
          ...ActionMeetingAgendaItemsStage @relay(mask: false)
        }
      }
      team {
        id
        agendaItems {
          id
          content
          teamMember {
            picture
            preferredName
          }
        }
        tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
          edges {
            node {
              ...MeetingAgendaCards_tasks
              id
              createdAt
              sortOrder
              threadId
            }
          }
        }
      }
    }
  `
})
