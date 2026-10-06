import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptDiscussionThreadHeader_stage$key} from '~/__generated__/TeamPromptDiscussionThreadHeader_stage.graphql'
import Avatar from '../Avatar/Avatar'
import lastAnswerUpdatedAt from './structured/lastAnswerUpdatedAt'
import TeamPromptSharedAnswers from './structured/TeamPromptSharedAnswers'
import {getMemberSharedAt, getSharedResponses} from './structured/teamPromptStages'
import TeamPromptLastUpdatedTime from './TeamPromptLastUpdatedTime'

interface Props {
  stageRef: TeamPromptDiscussionThreadHeader_stage$key
  prompts: readonly {id: string; question: string; groupColor: string}[]
}

const TeamPromptDiscussionThreadHeader = ({stageRef, prompts}: Props) => {
  const stage = useFragment(
    graphql`
      fragment TeamPromptDiscussionThreadHeader_stage on TeamPromptResponseStage {
        ...TeamPromptSharedAnswers_stage
        teamMember {
          user {
            picture
            preferredName
          }
        }
        responses {
          sharedAt
          updatedAt
        }
      }
    `,
    stageRef
  )
  const {teamMember, responses} = stage
  const sharedResponses = getSharedResponses(responses)
  const sharedAt = getMemberSharedAt(sharedResponses)
  return (
    <div className='self-start px-3 pt-4 pb-5'>
      <div className='flex items-center px-0 pb-3'>
        <Avatar picture={teamMember.user.picture} className='h-12 w-12' />
        <h3 className='m-0 px-2'>
          {teamMember.user.preferredName}
          {sharedAt && (
            <TeamPromptLastUpdatedTime
              updatedAt={lastAnswerUpdatedAt(sharedResponses, sharedAt)}
              createdAt={sharedAt}
            />
          )}
        </h3>
      </div>
      <div className='flex flex-col gap-3.5'>
        <TeamPromptSharedAnswers stageRef={stage} prompts={prompts} />
      </div>
    </div>
  )
}

export default TeamPromptDiscussionThreadHeader
