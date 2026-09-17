import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptResponseFooter_edges$key} from '~/__generated__/TeamPromptResponseFooter_edges.graphql'
import type {TeamPromptResponseFooter_response$key} from '~/__generated__/TeamPromptResponseFooter_response.graphql'
import plural from '~/utils/plural'
import PlainButton from '../../PlainButton/PlainButton'
import TeamPromptRepliesAvatarList from '../TeamPromptRepliesAvatarList'
import {TeamPromptResponseEmojis} from '../TeamPromptResponseEmojis'

interface Props {
  meetingId: string
  responseRef: TeamPromptResponseFooter_response$key
  edgesRef: TeamPromptResponseFooter_edges$key
  onReply: () => void
}

const TeamPromptResponseFooter = ({meetingId, responseRef, edgesRef, onReply}: Props) => {
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
    <div className='flex flex-wrap items-center justify-start pt-1'>
      <TeamPromptResponseEmojis responseRef={response} meetingId={meetingId} />
      <PlainButton
        className='flex items-start pt-2 font-semibold text-accent leading-6 hover:underline focus-visible:underline'
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
