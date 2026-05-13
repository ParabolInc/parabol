import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroMeetingUpdatesPrompt_meeting$key} from '../__generated__/RetroMeetingUpdatesPrompt_meeting.graphql'
import Avatar from './Avatar/Avatar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'

interface Props {
  meeting: RetroMeetingUpdatesPrompt_meeting$key
}

const StyledPrompt = styled('div')({
  display: 'flex'
})

const PromptText = styled('div')({
  marginLeft: 16,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
})

const StyledHeader = styled(PhaseHeaderTitle)({
  fontSize: 18,
  overflowWrap: 'break-word'
})

const getQuestion = (isConnected: boolean, taskCount: number, preferredName: string) => {
  if (isConnected) {
    return taskCount > 0 ? 'what’s changed with your tasks?' : 'what are you working on?'
  }
  return taskCount > 0
    ? `Any updates with ${preferredName}’s tasks?`
    : `What is ${preferredName} working on?`
}

const RetroMeetingUpdatesPrompt = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroMeetingUpdatesPrompt_meeting on RetrospectiveMeeting {
        team {
          tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
            edges {
              node {
                id
              }
            }
          }
        }
        meetingMembers {
          isConnectedAt
          user {
            picture
            preferredName
          }
          teamMember {
            id
            isSelf
          }
        }
        localStage {
          ...RetroMeetingUpdatesPromptLocalStage @relay(mask: false)
        }
      }
    `,
    meetingRef
  )
  const {localStage, team, meetingMembers} = meeting
  const {tasks} = team
  const currentMeetingMember = meetingMembers.find(
    (meetingMember) => meetingMember.teamMember.id === localStage?.teamMemberId
  )
  if (!currentMeetingMember) return null
  const {teamMember, user, isConnectedAt} = currentMeetingMember
  const {isSelf: isViewerMeetingSection} = teamMember
  const {picture, preferredName} = user
  const prefix = isConnectedAt ? `${preferredName}, ` : ''
  const taskCount = tasks.edges.length
  return (
    <StyledPrompt>
      <Avatar picture={picture} className={'h-16 w-16'} />
      <PromptText>
        <StyledHeader className='max-w-full'>
          {prefix}
          <i>{getQuestion(!!isConnectedAt, taskCount, preferredName)}</i>
        </StyledHeader>
        <PhaseHeaderDescription>
          {isViewerMeetingSection && taskCount === 0 && 'Add cards to track your current work.'}
          {isViewerMeetingSection &&
            taskCount > 0 &&
            'Your turn to share! Quick updates only, please.'}
          {!isViewerMeetingSection && isConnectedAt && `${preferredName} is sharing.`}
        </PhaseHeaderDescription>
      </PromptText>
    </StyledPrompt>
  )
}

graphql`
  fragment RetroMeetingUpdatesPromptLocalStage on UpdatesStage {
    teamMemberId
  }
`

export default RetroMeetingUpdatesPrompt
