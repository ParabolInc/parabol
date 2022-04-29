import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import ActionMeetingUpdatesPromptTeamHelpText from '../modules/meeting/components/ActionMeetingUpdatesPromptTeamHelpText'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import {ActionMeetingUpdatesPrompt_meeting} from '../__generated__/ActionMeetingUpdatesPrompt_meeting.graphql'
import Avatar from './Avatar/Avatar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'

interface Props {
  meeting: ActionMeetingUpdatesPrompt_meeting
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
  fontSize: 18
})

const getQuestion = (isConnected, taskCount, preferredName) => {
  if (isConnected) {
    return taskCount > 0 ? 'what’s changed with your tasks?' : 'what are you working on?'
  }
  return taskCount > 0
    ? `Any updates with ${preferredName}’s tasks?`
    : `What is ${preferredName} working on?`
}

const ActionMeetingUpdatesPrompt = (props: Props) => {
  const {meeting} = props
  const {localStage, team, meetingMembers} = meeting
  const {tasks} = team
  const currentMeetingMember = meetingMembers.find(
    (meetingMember) => meetingMember.teamMember.id === localStage.teamMemberId
  )
  if (!currentMeetingMember) return null
  const {teamMember, user} = currentMeetingMember
  const {isSelf: isViewerMeetingSection, picture, preferredName} = teamMember
  const {isConnected} = user
  const prefix = isConnected ? `${preferredName}, ` : ''
  const taskCount = tasks.edges.length
  return (
    <StyledPrompt>
      <Avatar picture={picture || defaultUserAvatar} size={64} />
      <PromptText>
        <StyledHeader>
          {prefix}
          <i>{getQuestion(isConnected, taskCount, preferredName)}</i>
        </StyledHeader>
        <PhaseHeaderDescription>
          {isViewerMeetingSection && taskCount === 0 && 'Add cards to track your current work.'}
          {isViewerMeetingSection &&
            taskCount > 0 &&
            'Your turn to share! Quick updates only, please.'}
          {!isViewerMeetingSection && (
            <ActionMeetingUpdatesPromptTeamHelpText currentMeetingMember={currentMeetingMember} />
          )}
        </PhaseHeaderDescription>
      </PromptText>
    </StyledPrompt>
  )
}

graphql`
  fragment ActionMeetingUpdatesPromptLocalStage on UpdatesStage {
    teamMemberId
  }
`

export default createFragmentContainer(ActionMeetingUpdatesPrompt, {
  meeting: graphql`
    fragment ActionMeetingUpdatesPrompt_meeting on ActionMeeting {
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
        ...ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember
        user {
          isConnected
        }
        teamMember {
          id
          isSelf
          picture
          preferredName
        }
      }
      phases {
        stages {
          ...ActionMeetingUpdatesPromptLocalStage @relay(mask: false)
        }
      }
      localStage {
        ...ActionMeetingUpdatesPromptLocalStage @relay(mask: false)
      }
    }
  `
})
