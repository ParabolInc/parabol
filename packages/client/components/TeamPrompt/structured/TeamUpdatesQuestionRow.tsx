import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamUpdatesQuestionRow_stage$key} from '~/__generated__/TeamUpdatesQuestionRow_stage.graphql'
import {cn} from '../../../ui/cn'
import Avatar from '../../Avatar/Avatar'
import TeamPromptLastUpdatedTime from '../TeamPromptLastUpdatedTime'
import lastAnswerUpdatedAt from './lastAnswerUpdatedAt'
import TeamPromptAnswerBlock from './TeamPromptAnswerBlock'
import TeamPromptResponseFooter from './TeamPromptResponseFooter'

interface Props {
  stageRef: TeamUpdatesQuestionRow_stage$key
  prompt: {id: string; question: string; groupColor: string}
  teamId: string
  meetingId: string
  isDrafting: boolean
  isSelected: boolean
  promptCount: number
  onReply: (stageId: string) => void
}

const TeamUpdatesQuestionRow = (props: Props) => {
  const {stageRef, prompt, teamId, meetingId, isDrafting, isSelected, promptCount, onReply} = props
  const stage = useFragment(
    graphql`
      fragment TeamUpdatesQuestionRow_stage on TeamPromptResponseStage {
        id
        teamMember {
          user {
            preferredName
            picture
          }
        }
        discussion {
          thread(first: 1000) @connection(key: "DiscussionThread_thread") {
            edges {
              ...TeamPromptResponseFooter_edges
            }
          }
        }
        response {
          id
          sharedAt
          answeredPromptIds
          answers {
            id
            promptId
            content
            updatedAt
          }
          ...TeamPromptResponseFooter_response
        }
      }
    `,
    stageRef
  )
  const {id: stageId, teamMember, discussion, response} = stage
  const {preferredName, picture} = teamMember.user
  const answer = response?.answers.find((entry) => entry.promptId === prompt.id)
  const answeredCount = response?.answeredPromptIds.length ?? 0
  return (
    <div
      className={cn(
        'flex gap-3.5 rounded-card px-4 py-3.5',
        isDrafting ? 'bg-surface-well' : 'bg-surface-card shadow-[var(--shadow-card)]',
        isSelected ? 'outline-2 outline-sky-300' : 'outline-none'
      )}
    >
      <Avatar picture={picture} className={cn('h-10 w-10 shrink-0', isDrafting && 'opacity-55')} />
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <h3 className='m-0 min-w-0 truncate font-semibold text-[15px]'>{preferredName}</h3>
          {isDrafting ? (
            <span className='shrink-0 whitespace-nowrap text-fg-muted text-xs'>
              Hasn't shared yet · {answeredCount} of {promptCount} answered
            </span>
          ) : (
            response?.sharedAt && (
              <span className='flex shrink-0 items-center gap-1 whitespace-nowrap text-fg-muted text-xs'>
                · shared{' '}
                <TeamPromptLastUpdatedTime
                  createdAt={response.sharedAt}
                  updatedAt={lastAnswerUpdatedAt(response.answers, response.sharedAt)}
                />
              </span>
            )
          )}
        </div>
        {!isDrafting && answer && response && (
          <>
            <TeamPromptAnswerBlock
              teamId={teamId}
              prompt={prompt}
              content={answer.content}
              showLabel={false}
              textClassName='text-sm leading-6'
            />
            <TeamPromptResponseFooter
              meetingId={meetingId}
              responseRef={response}
              edgesRef={discussion.thread.edges}
              onReply={() => onReply(stageId)}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default TeamUpdatesQuestionRow
