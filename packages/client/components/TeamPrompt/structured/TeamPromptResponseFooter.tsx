import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptResponseFooter_edges$key} from '~/__generated__/TeamPromptResponseFooter_edges.graphql'
import type {TeamPromptResponseFooter_response$key} from '~/__generated__/TeamPromptResponseFooter_response.graphql'
import plural from '~/utils/plural'
import {cn} from '../../../ui/cn'
import PlainButton from '../../PlainButton/PlainButton'
import TeamPromptRepliesAvatarList from '../TeamPromptRepliesAvatarList'
import {TeamPromptResponseEmojis} from '../TeamPromptResponseEmojis'

interface Props {
  meetingId: string
  responseRef: TeamPromptResponseFooter_response$key
  edgesRef: TeamPromptResponseFooter_edges$key
  onReply: () => void
  isPhone?: boolean
  className?: string
}

const TeamPromptResponseFooter = ({
  meetingId,
  responseRef,
  edgesRef,
  onReply,
  isPhone,
  className
}: Props) => {
  const response = useFragment(
    graphql`
      fragment TeamPromptResponseFooter_response on TeamPromptResponse {
        ...TeamPromptResponseEmojis_response
      }
    `,
    responseRef
  )
  const edges = useFragment(
    graphql`
      fragment TeamPromptResponseFooter_edges on ThreadableEdge @relay(plural: true) {
        ...TeamPromptRepliesAvatarList_edges
      }
    `,
    edgesRef
  )
  const replyCount = edges.length
  return (
    <div className={cn('flex flex-wrap items-center justify-start pt-1', className)}>
      <TeamPromptResponseEmojis responseRef={response} meetingId={meetingId} isPhone={isPhone} />
      <PlainButton
        className={cn(
          'font-semibold text-accent hover:underline focus-visible:underline',
          isPhone ? 'flex h-10 items-center text-sm' : 'flex items-start pt-2 leading-6'
        )}
        onClick={onReply}
      >
        {replyCount > 0 ? (
          <>
            <TeamPromptRepliesAvatarList edgesRef={edges} />
            {replyCount} {plural(replyCount, 'Reply', 'Replies')}
          </>
        ) : (
          'Reply'
        )}
      </PlainButton>
    </div>
  )
}

export default TeamPromptResponseFooter
