import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ThreadedRepliesList_discussion$key} from '~/__generated__/ThreadedRepliesList_discussion.graphql'
import {ThreadedRepliesList_replies$key} from '~/__generated__/ThreadedRepliesList_replies.graphql'
import {ThreadedRepliesList_viewer$key} from '~/__generated__/ThreadedRepliesList_viewer.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import ThreadedCommentBase from './ThreadedCommentBase'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  discussion: ThreadedRepliesList_discussion$key
  replies: ThreadedRepliesList_replies$key
  viewer: ThreadedRepliesList_viewer$key
}

const ThreadedRepliesList = (props: Props) => {
  const {
    allowedThreadables,
    replies: repliesRef,
    discussion: discussionRef,
    viewer: viewerRef
  } = props
  const viewer = useFragment(
    graphql`
      fragment ThreadedRepliesList_viewer on User {
        ...ThreadedCommentBase_viewer
        ...ThreadedTaskBase_viewer
      }
    `,
    viewerRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedRepliesList_discussion on Discussion {
        ...ThreadedCommentBase_discussion
        ...ThreadedTaskBase_discussion
      }
    `,
    discussionRef
  )
  const replies = useFragment(
    graphql`
      fragment ThreadedRepliesList_replies on Threadable @relay(plural: true) {
        ...ThreadedTaskBase_task
        ...ThreadedCommentBase_comment
        __typename
        id
        threadSortOrder
      }
    `,
    repliesRef
  )
  const getMaxSortOrder = () => {
    return replies ? Math.max(0, ...replies.map((reply) => reply.threadSortOrder || 0)) : 0
  }
  return (
    <>
      {replies?.map((reply) => {
        const {__typename, id} = reply
        return __typename === 'Task' ? (
          <ThreadedTaskBase
            allowedThreadables={allowedThreadables}
            key={id}
            task={reply}
            discussion={discussion}
            viewer={viewer}
            getMaxSortOrder={getMaxSortOrder}
          />
        ) : (
          <ThreadedCommentBase
            allowedThreadables={allowedThreadables}
            key={id}
            comment={reply}
            discussion={discussion}
            viewer={viewer}
            getMaxSortOrder={getMaxSortOrder}
          />
        )
      })}
    </>
  )
}

export default ThreadedRepliesList
