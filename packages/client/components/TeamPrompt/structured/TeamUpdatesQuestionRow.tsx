import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamUpdatesQuestionRow_stage$key} from '~/__generated__/TeamUpdatesQuestionRow_stage.graphql'
import {cn} from '../../../ui/cn'
import Avatar from '../../Avatar/Avatar'
import TeamPromptLastUpdatedTime from '../TeamPromptLastUpdatedTime'
import lastAnswerUpdatedAt from './lastAnswerUpdatedAt'
import TeamPromptAnswerBlock from './TeamPromptAnswerBlock'
import TeamPromptResponseFooter from './TeamPromptResponseFooter'
import {getMemberSharedAt, getSharedResponses} from './teamPromptStages'

interface Props {
  stageRef: TeamUpdatesQuestionRow_stage$key
  prompt: {id: string; question: string; groupColor: string}
  isWaiting: boolean
  isEnded: boolean
  isSelected: boolean
  onReply: (stageId: string) => void
  isPhone?: boolean
}

const TeamUpdatesQuestionRow = (props: Props) => {
  const {stageRef, prompt, isWaiting, isEnded, isSelected, onReply, isPhone} = props
  const stage = useFragment(
    graphql`
      fragment TeamUpdatesQuestionRow_stage on TeamPromptResponseStage {
        id
        meetingId
        teamId
        teamMember {
          user {
            preferredName
            picture
          }
        }
        discussion {
          thread(first: 1000) @connection(key: "DiscussionThread_thread") {
            edges {
              ...TeamPromptReplyButton_edges
            }
          }
        }
        responses {
          id
          promptId
          content
          sharedAt
          updatedAt
          ...TeamPromptResponseFooter_response
        }
      }
    `,
    stageRef
  )
  const {id: stageId, meetingId, teamId, teamMember, discussion, responses} = stage
  const {preferredName, picture} = teamMember.user
  const sharedResponses = getSharedResponses(responses)
  const sharedAt = getMemberSharedAt(sharedResponses)
  const response = sharedResponses.find((entry) => entry.promptId === prompt.id)
  return (
    <div
      className={cn(
        'flex rounded-card',
        isPhone ? 'gap-2 p-[12px_14px]' : 'gap-3.5 px-4 py-3.5',
        isWaiting ? 'bg-surface-well' : 'bg-surface-card shadow-[var(--shadow-card)]',
        isSelected ? 'outline-2 outline-sky-300' : 'outline-none'
      )}
    >
      <Avatar
        picture={picture}
        className={cn('shrink-0', isPhone ? 'h-7 w-7' : 'h-10 w-10', isWaiting && 'opacity-55')}
      />
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <h3
            className={cn(
              'm-0 min-w-0 truncate font-semibold',
              isPhone ? 'text-sm' : 'text-[15px]'
            )}
          >
            {preferredName}
          </h3>
          {isWaiting ? (
            <span className='shrink-0 whitespace-nowrap text-fg-primary text-xs'>
              {isEnded ? 'No response' : "Hasn't shared yet"}
            </span>
          ) : (
            sharedAt && (
              <span className='flex shrink-0 items-center gap-1 whitespace-nowrap text-fg-muted text-xs'>
                · shared{' '}
                <TeamPromptLastUpdatedTime
                  createdAt={sharedAt}
                  updatedAt={lastAnswerUpdatedAt(sharedResponses, sharedAt)}
                />
              </span>
            )
          )}
        </div>
        {!isWaiting && response && (
          <>
            <TeamPromptAnswerBlock
              teamId={teamId}
              prompt={prompt}
              content={response.content}
              showLabel={false}
              textClassName={isPhone ? 'text-[15px] leading-[22px]' : 'text-sm leading-6'}
            />
            <TeamPromptResponseFooter
              meetingId={meetingId}
              responseRef={response}
              edgesRef={discussion.thread.edges}
              onReply={() => onReply(stageId)}
              isPhone={isPhone}
              className={isPhone ? '-ml-2' : undefined}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default TeamUpdatesQuestionRow
