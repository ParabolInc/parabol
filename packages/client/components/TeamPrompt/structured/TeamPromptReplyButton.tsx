import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptReplyButton_edges$key} from '~/__generated__/TeamPromptReplyButton_edges.graphql'
import plural from '~/utils/plural'
import {cn} from '../../../ui/cn'
import PlainButton from '../../PlainButton/PlainButton'
import TeamPromptRepliesAvatarList from '../TeamPromptRepliesAvatarList'

interface Props {
  edgesRef: TeamPromptReplyButton_edges$key
  onReply: () => void
  isPhone?: boolean
}

const TeamPromptReplyButton = ({edgesRef, onReply, isPhone}: Props) => {
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
  )
}

export default TeamPromptReplyButton
