import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptReplyButton_edges$key} from '~/__generated__/TeamPromptReplyButton_edges.graphql'
import plural from '~/utils/plural'
import PlainButton from '../../PlainButton/PlainButton'
import TeamPromptRepliesAvatarList from '../TeamPromptRepliesAvatarList'

interface Props {
  edgesRef: TeamPromptReplyButton_edges$key
  onReply: () => void
}

const TeamPromptReplyButton = ({edgesRef, onReply}: Props) => {
  const edges = useFragment(
    graphql`
      fragment TeamPromptReplyButton_edges on ThreadableEdge @relay(plural: true) {
        ...TeamPromptRepliesAvatarList_edges
      }
    `,
    edgesRef
  )
  const replyCount = edges.length
  return (
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
  )
}

export default TeamPromptReplyButton
