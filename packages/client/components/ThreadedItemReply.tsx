import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ThreadedItemReply_discussion$key} from '~/__generated__/ThreadedItemReply_discussion.graphql'
import {ThreadedItemReply_threadable$key} from '~/__generated__/ThreadedItemReply_threadable.graphql'
import {ThreadedItemReply_viewer$key} from '~/__generated__/ThreadedItemReply_viewer.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'
import {DiscussionThreadables} from './DiscussionThreadList'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  threadable: ThreadedItemReply_threadable$key
  discussion: ThreadedItemReply_discussion$key
  viewer: ThreadedItemReply_viewer$key
}

const ThreadedItemReply = (props: Props) => {
  const {
    allowedThreadables,
    threadable: threadableRef,
    discussion: discussionRef,
    viewer: viewerRef
  } = props
  const viewer = useFragment(
    graphql`
      fragment ThreadedItemReply_viewer on User {
        ...DiscussionThreadInput_viewer
      }
    `,
    viewerRef
  )
  const threadable = useFragment(
    graphql`
      fragment ThreadedItemReply_threadable on Threadable {
        id
        replies {
          id
          threadSortOrder
        }
      }
    `,
    threadableRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedItemReply_discussion on Discussion {
        ...DiscussionThreadInput_discussion
        replyingTo {
          id
        }
      }
    `,
    discussionRef
  )
  const {id: threadableId, replies} = threadable
  const {replyingTo} = discussion
  const isReplying = replyingTo?.id === threadableId
  if (!isReplying) return null
  const getMaxSortOrder = () => {
    return replies ? Math.max(0, ...replies.map((reply) => reply.threadSortOrder || 0)) : 0
  }
  return (
    <DiscussionThreadInput
      allowedThreadables={allowedThreadables}
      isReply
      getMaxSortOrder={getMaxSortOrder}
      discussion={discussion}
      threadParentId={threadableId}
      viewer={viewer}
    />
  )
}

export default ThreadedItemReply
