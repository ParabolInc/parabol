import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ActionMeetingUpdatesPrompt_meeting$key} from '../__generated__/ActionMeetingUpdatesPrompt_meeting.graphql'
import ActionMeetingUpdatesPromptTeamHelpText from '../modules/meeting/components/ActionMeetingUpdatesPromptTeamHelpText'
import Avatar from './Avatar/Avatar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'

interface Props {
  meeting: ActionMeetingUpdatesPrompt_meeting$key
}

const getQuestion = (isConnected: boolean, taskCount: number, preferredName: string) => {
  if (isConnected) {
    return taskCount > 0 ? 'what’s changed with your tasks?' : 'what are you working on?'
  }
  return taskCount > 0
    ? `Any updates with ${preferredName}’s tasks?`
    : `What is ${preferredName} working on?`
}

const ActionMeetingUpdatesPrompt = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
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
        phases {
          stages {
            ...ActionMeetingUpdatesPromptLocalStage @relay(mask: false) @alias
          }
        }
        localStage {
          ...ActionMeetingUpdatesPromptLocalStage @relay(mask: false) @alias
        }
      }
    `,
    meetingRef
  )
  const {localStage, team, meetingMembers} = meeting
  const {tasks} = team
  const currentMeetingMember = meetingMembers.find(
    (meetingMember) =>
      meetingMember.teamMember.id === localStage.ActionMeetingUpdatesPromptLocalStage?.teamMemberId
  )
  if (!currentMeetingMember) return null
  const {teamMember, user, isConnectedAt} = currentMeetingMember
  const {isSelf: isViewerMeetingSection} = teamMember
  const {picture, preferredName} = user
  const prefix = isConnectedAt ? `${preferredName}, ` : ''
  const taskCount = tasks.edges.length
  return (
    <div className='flex'>
      <Avatar picture={picture} className={'h-16 w-16'} />
      <div className='ml-4 flex flex-col justify-center'>
        <PhaseHeaderTitle className='max-w-full break-words text-[18px] xl:text-[18px]'>
          {prefix}
          <i>{getQuestion(!!isConnectedAt, taskCount, preferredName)}</i>
        </PhaseHeaderTitle>
        <PhaseHeaderDescription>
          {isViewerMeetingSection && taskCount === 0 && 'Add cards to track your current work.'}
          {isViewerMeetingSection &&
            taskCount > 0 &&
            'Your turn to share! Quick updates only, please.'}
          {!isViewerMeetingSection && (
            <ActionMeetingUpdatesPromptTeamHelpText currentMeetingMember={currentMeetingMember} />
          )}
        </PhaseHeaderDescription>
      </div>
    </div>
  )
}

graphql`
  fragment ActionMeetingUpdatesPromptLocalStage on UpdatesStage {
    teamMemberId
  }
`

export default ActionMeetingUpdatesPrompt
