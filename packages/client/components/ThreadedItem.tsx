import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ThreadedItem_discussion$key} from '~/__generated__/ThreadedItem_discussion.graphql'
import {ThreadedItem_threadable$key} from '~/__generated__/ThreadedItem_threadable.graphql'
import {ThreadedItem_viewer$key} from '~/__generated__/ThreadedItem_viewer.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import ThreadedCommentBase from './ThreadedCommentBase'
import ThreadedPollBase from './ThreadedPollBase'
import ThreadedRepliesList from './ThreadedRepliesList'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  threadable: ThreadedItem_threadable$key
  discussion: ThreadedItem_discussion$key
  viewer: ThreadedItem_viewer$key
}

export type ReplyMention = {
  userId: string
  preferredName: string
} | null

export type SetReplyMention = (replyMention: ReplyMention) => void

export const ThreadedItem = (props: Props) => {
  const {
    allowedThreadables,
    threadable: threadableRef,
    discussion: discussionRef,
    viewer: viewerRef
  } = props
  const viewer = useFragment(
    graphql`
      fragment ThreadedItem_viewer on User {
        ...ThreadedTaskBase_viewer
        ...ThreadedCommentBase_viewer
        ...ThreadedRepliesList_viewer
      }
    `,
    viewerRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedItem_discussion on Discussion {
        ...ThreadedCommentBase_discussion
        ...ThreadedTaskBase_discussion
        ...ThreadedPollBase_discussion
        ...ThreadedRepliesList_discussion
      }
    `,
    discussionRef
  )
  const threadable = useFragment(
    graphql`
      fragment ThreadedItem_threadable on Threadable {
        ...ThreadedCommentBase_comment
        ...ThreadedTaskBase_task
        ...ThreadedPollBase_poll
        __typename
        replies {
          ...ThreadedRepliesList_replies
          threadSortOrder
        }
      }
    `,
    threadableRef
  )
  const {__typename, replies} = threadable
  const getMaxSortOrder = () => {
    return replies ? Math.max(0, ...replies.map((reply) => reply.threadSortOrder || 0)) : 0
  }
  const repliesList = (
    <ThreadedRepliesList
      allowedThreadables={allowedThreadables}
      discussion={discussion}
      replies={replies}
      viewer={viewer}
    />
  )
  if (__typename === 'Task') {
    return (
      <ThreadedTaskBase
        allowedThreadables={allowedThreadables}
        task={threadable}
        discussion={discussion}
        viewer={viewer}
        repliesList={repliesList}
        getMaxSortOrder={getMaxSortOrder}
      />
    )
  }
  if (__typename === 'Poll') {
    return (
      <ThreadedPollBase
        allowedThreadables={allowedThreadables}
        pollRef={threadable}
        discussionRef={discussion}
      />
    )
  }
  return (
    <ThreadedCommentBase
      allowedThreadables={allowedThreadables}
      comment={threadable}
      discussion={discussion}
      viewer={viewer}
      repliesList={repliesList}
      getMaxSortOrder={getMaxSortOrder}
    />
  )
}

export default ThreadedItem
