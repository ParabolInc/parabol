import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import type {ReactNode} from 'react'
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
  title?: string
  footerAction?: ReactNode
}

const TeamPromptSharedResponseCard = (props: Props) => {
  const {stageRef, prompts, isSelected, onReply, title, footerAction} = props
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
  const replyButton = (
    <TeamPromptReplyButton edgesRef={discussion.thread.edges} onReply={() => onReply(stageId)} />
  )
  return (
    <motion.div
      layout='position'
      className={cn(TEAM_UPDATES_COLUMN, 'flex flex-col')}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
    >
      <div className='mb-3 flex items-center gap-2 px-2 max-md:mb-2 max-md:px-1'>
        <Avatar picture={picture} className='h-12 w-12 shrink-0 max-md:h-8 max-md:w-8' />
        <h3 className='m-0 min-w-0 truncate font-semibold text-base'>{title ?? preferredName}</h3>
        <span className='flex shrink-0 items-center gap-1 whitespace-nowrap text-fg-muted text-xs'>
          · shared{' '}
          <TeamPromptLastUpdatedTime
            createdAt={sharedAt}
            updatedAt={lastAnswerUpdatedAt(sharedResponses, sharedAt)}
          />
        </span>
        <TeamPromptResponsePermalink
          meetingId={meetingId}
          teamId={teamId}
          responseId={firstResponse.id}
        />
      </div>
      <div
        className={cn(
          'flex flex-col gap-3.5 rounded-card bg-surface-card p-4 shadow-[var(--shadow-card)]',
          isSelected ? 'outline-2 outline-sky-300' : 'outline-none'
        )}
      >
        <TeamPromptSharedAnswers stageRef={stage} prompts={prompts} />
        {footerAction ? (
          <div className='flex items-end justify-between gap-2'>
            {replyButton}
            {footerAction}
          </div>
        ) : (
          replyButton
        )}
      </div>
    </motion.div>
  )
}

export default TeamPromptSharedResponseCard
