import {ActionMeetingUpdatesPrompt_team} from '__generated__/ActionMeetingUpdatesPrompt_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import PhaseHeaderDescription from 'universal/components/PhaseHeaderDescription'
import PhaseHeaderTitle from 'universal/components/PhaseHeaderTitle'
import ActionMeetingUpdatesPromptTeamHelpText from 'universal/modules/meeting/components/ActionMeetingUpdatesPromptTeamHelpText'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import Avatar from 'universal/components/Avatar/Avatar'

interface Props {
  team: ActionMeetingUpdatesPrompt_team
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

const getQuestion = (isCheckedIn, taskCount, preferredName) => {
  if (isCheckedIn) {
    return taskCount > 0 ? 'what’s changed with your tasks?' : 'what are you working on?'
  }
  return taskCount > 0
    ? `Any updates with ${preferredName}’s tasks?`
    : `What is ${preferredName} working on?`
}

const ActionMeetingUpdatesPrompt = (props: Props) => {
  const {team} = props
  const {newMeeting, tasks, teamMembers} = team
  const {localStage} = newMeeting!
  const currentTeamMember = teamMembers.find(
    (teamMember) => teamMember.id === localStage.teamMemberId
  )
  if (!currentTeamMember) return null
  const {isSelf: isMyMeetingSection, meetingMember, picture, preferredName} = currentTeamMember
  const {isCheckedIn} = meetingMember!
  const prefix = isCheckedIn ? `${preferredName},` : ''
  const taskCount = tasks.edges.length
  return (
    <StyledPrompt>
      <Avatar picture={picture || defaultUserAvatar} size={64} />
      <PromptText>
        <StyledHeader>
          {prefix}
          <i>{getQuestion(isCheckedIn, taskCount, preferredName)}</i>
        </StyledHeader>
        <PhaseHeaderDescription>
          {isMyMeetingSection && taskCount === 0 && 'Add cards to track your current work.'}
          {isMyMeetingSection && taskCount > 0 && 'Your turn to share! Quick updates only, please.'}
          {!isMyMeetingSection && (
            <ActionMeetingUpdatesPromptTeamHelpText currentTeamMember={currentTeamMember} />
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

export default createFragmentContainer(
  ActionMeetingUpdatesPrompt,
  graphql`
    fragment ActionMeetingUpdatesPrompt_team on Team {
      tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
        edges {
          node {
            id
          }
        }
      }
      teamMembers(sortBy: "checkInOrder") {
        ...ActionMeetingUpdatesPromptTeamHelpText_currentTeamMember
        id
        isSelf
        picture
        preferredName
        meetingMember {
          isCheckedIn
        }
      }
      newMeeting {
        phases {
          stages {
            ...ActionMeetingUpdatesPromptLocalStage @relay(mask: false)
          }
        }
        localStage {
          ...ActionMeetingUpdatesPromptLocalStage @relay(mask: false)
        }
      }
    }
  `
)
