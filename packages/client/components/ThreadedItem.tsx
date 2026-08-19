import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ThreadedItem_discussion$key} from '~/__generated__/ThreadedItem_discussion.graphql'
import type {ThreadedItem_threadable$key} from '~/__generated__/ThreadedItem_threadable.graphql'
import type {ThreadedItem_viewer$key} from '~/__generated__/ThreadedItem_viewer.graphql'
import type {DiscussionThreadables} from './DiscussionThreadList'
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
        ...ThreadedCommentBase_comment @alias
        ...ThreadedTaskBase_task @alias
        ...ThreadedPollBase_poll @alias
        __typename
        replies {
          ...ThreadedRepliesList_replies
          threadSortOrder
        }
      }
    `,
    threadableRef
  )
  const {ThreadedTaskBase_task, ThreadedPollBase_poll, ThreadedCommentBase_comment, replies} =
    threadable
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
  if (ThreadedTaskBase_task) {
    return (
      <ThreadedTaskBase
        allowedThreadables={allowedThreadables}
        task={ThreadedTaskBase_task}
        discussion={discussion}
        viewer={viewer}
        repliesList={repliesList}
        getMaxSortOrder={getMaxSortOrder}
      />
    )
  }
  if (ThreadedPollBase_poll) {
    return (
      <ThreadedPollBase
        allowedThreadables={allowedThreadables}
        pollRef={ThreadedPollBase_poll}
        discussionRef={discussion}
      />
    )
  }
  if (!ThreadedCommentBase_comment) return null
  return (
    <ThreadedCommentBase
      allowedThreadables={allowedThreadables}
      comment={ThreadedCommentBase_comment}
      discussion={discussion}
      viewer={viewer}
      repliesList={repliesList}
      getMaxSortOrder={getMaxSortOrder}
    />
  )
}

export default ThreadedItem
