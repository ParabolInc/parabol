import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import {useFragment} from 'react-relay'
import type {TeamPromptSharedResponseCard_stage$key} from '~/__generated__/TeamPromptSharedResponseCard_stage.graphql'
import {cn} from '../../../ui/cn'
import Avatar from '../../Avatar/Avatar'
import TeamPromptLastUpdatedTime from '../TeamPromptLastUpdatedTime'
import lastAnswerUpdatedAt from './lastAnswerUpdatedAt'
import TeamPromptReplyButton from './TeamPromptReplyButton'
import TeamPromptResponsePermalink from './TeamPromptResponsePermalink'
import TeamPromptSharedAnswers from './TeamPromptSharedAnswers'
import {getMemberSharedAt, getSharedResponses} from './teamPromptStages'
import {TEAM_UPDATES_COLUMN} from './teamUpdatesLayout'

interface Props {
  stageRef: TeamPromptSharedResponseCard_stage$key
  prompts: readonly {id: string; question: string; groupColor: string}[]
  isSelected: boolean
  onReply: (stageId: string) => void
  isPhone?: boolean
}

const TeamPromptSharedResponseCard = (props: Props) => {
  const {stageRef, prompts, isSelected, onReply, isPhone} = props
  const stage = useFragment(
    graphql`
      fragment TeamPromptSharedResponseCard_stage on TeamPromptResponseStage {
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
          sharedAt
          updatedAt
        }
        ...TeamPromptSharedAnswers_stage
      }
    `,
    stageRef
  )
  const {id: stageId, meetingId, teamId, teamMember, discussion, responses} = stage
  const sharedResponses = getSharedResponses(responses)
  const sharedAt = getMemberSharedAt(sharedResponses)
  const firstResponse = sharedResponses[0]
  if (!sharedAt || !firstResponse) return null
  const {preferredName, picture} = teamMember.user
  return (
    <motion.div
      layout='position'
      className={cn(TEAM_UPDATES_COLUMN, 'flex flex-col')}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
    >
      <div className='mb-3 flex items-center gap-2 px-2'>
        <Avatar picture={picture} className={cn('shrink-0', isPhone ? 'h-9 w-9' : 'h-12 w-12')} />
        <h3
          className={cn(
            'm-0 min-w-0 truncate font-semibold',
            isPhone ? 'text-[15px]' : 'text-base'
          )}
        >
          {preferredName}
        </h3>
        {response.sharedAt && (
          <span className='flex shrink-0 items-center gap-1 whitespace-nowrap text-fg-muted text-xs'>
            · shared{' '}
            <TeamPromptLastUpdatedTime
              createdAt={response.sharedAt}
              updatedAt={lastAnswerUpdatedAt(response.answers, response.sharedAt)}
            />
          </span>
        )}
        <TeamPromptResponsePermalink
          meetingId={meetingId}
          teamId={teamId}
          responseId={response.id}
          isPhone={isPhone}
        />
      </div>
      <div
        className={cn(
          'flex flex-col gap-3.5 rounded-card bg-surface-card p-4 shadow-[var(--shadow-card)]',
          isSelected ? 'outline-2 outline-sky-300' : 'outline-none'
        )}
      >
        {prompts.map((prompt) => {
          const answer = answersByPrompt.get(prompt.id)
          if (!answer) return null
          return (
            <TeamPromptAnswerBlock
              key={answer.id}
              teamId={teamId}
              prompt={prompt}
              content={answer.content}
              textClassName={isPhone ? 'pl-[18px] text-[15px] leading-[22px]' : undefined}
            />
          )
        })}
        <TeamPromptResponseFooter
          meetingId={meetingId}
          responseRef={response}
          edgesRef={discussion.thread.edges}
          onReply={() => onReply(stageId)}
          isPhone={isPhone}
        />
      </div>
    </motion.div>
  )
}

export default TeamPromptSharedResponseCard
