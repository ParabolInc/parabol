import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import {useFragment} from 'react-relay'
import type {TeamPromptSharedResponseCard_stage$key} from '~/__generated__/TeamPromptSharedResponseCard_stage.graphql'
import {cn} from '../../../ui/cn'
import Avatar from '../../Avatar/Avatar'
import TeamPromptLastUpdatedTime from '../TeamPromptLastUpdatedTime'
import lastAnswerUpdatedAt from './lastAnswerUpdatedAt'
import TeamPromptAnswerBlock from './TeamPromptAnswerBlock'
import TeamPromptResponseFooter from './TeamPromptResponseFooter'
import TeamPromptResponsePermalink from './TeamPromptResponsePermalink'
import {TEAM_UPDATES_COLUMN} from './teamUpdatesLayout'

interface Props {
  stageRef: TeamPromptSharedResponseCard_stage$key
  prompts: readonly {id: string; question: string; groupColor: string}[]
  isSelected: boolean
  onReply: (stageId: string) => void
}

const TeamPromptSharedResponseCard = (props: Props) => {
  const {stageRef, prompts, isSelected, onReply} = props
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
              ...TeamPromptResponseFooter_edges
            }
          }
        }
        response {
          id
          sharedAt
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
  const {id: stageId, meetingId, teamId, teamMember, discussion, response} = stage
  if (!response) return null
  const {preferredName, picture} = teamMember.user
  const answersByPrompt = new Map(response.answers.map((answer) => [answer.promptId, answer]))
  return (
    <motion.div
      layout='position'
      className={cn(TEAM_UPDATES_COLUMN, 'flex flex-col')}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
    >
      <div className='mb-3 flex items-center gap-2 px-2'>
        <Avatar picture={picture} className='h-12 w-12 shrink-0' />
        <h3 className='m-0 min-w-0 truncate font-semibold text-base'>{preferredName}</h3>
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
            />
          )
        })}
        <TeamPromptResponseFooter
          meetingId={meetingId}
          responseRef={response}
          edgesRef={discussion.thread.edges}
          onReply={() => onReply(stageId)}
        />
      </div>
    </motion.div>
  )
}

export default TeamPromptSharedResponseCard
