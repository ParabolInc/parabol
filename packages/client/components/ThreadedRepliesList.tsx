import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ThreadedRepliesList_discussion$key} from '~/__generated__/ThreadedRepliesList_discussion.graphql'
import {ThreadedRepliesList_replies$key} from '~/__generated__/ThreadedRepliesList_replies.graphql'
import {ThreadedRepliesList_viewer$key} from '~/__generated__/ThreadedRepliesList_viewer.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import ThreadedCommentBase from './ThreadedCommentBase'
import {SetReplyMention} from './ThreadedItem'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  discussion: ThreadedRepliesList_discussion$key
  replies: ThreadedRepliesList_replies$key
  setReplyMention: SetReplyMention
  dataCy: string
  viewer: ThreadedRepliesList_viewer$key
}

const ThreadedRepliesList = (props: Props) => {
  const {
    allowedThreadables,
    replies: repliesRef,
    setReplyMention,
    discussion: discussionRef,
    dataCy,
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
      }
    `,
    repliesRef
  )
  // https://sentry.io/organizations/parabol/issues/1569570376/?project=107196&query=is%3Aunresolved
  // not sure why this is required addComment and createTask but request replies
  if (!replies) return null
  return (
    <>
      {replies.map((reply) => {
        const {__typename, id} = reply
        return __typename === 'Task' ? (
          <ThreadedTaskBase
            allowedThreadables={allowedThreadables}
            dataCy={`${dataCy}-task`}
            key={id}
            isReply
            task={reply}
            discussion={discussion}
            setReplyMention={setReplyMention}
            viewer={viewer}
          />
        ) : (
          <ThreadedCommentBase
            allowedThreadables={allowedThreadables}
            dataCy={`${dataCy}-comment`}
            key={id}
            isReply
            comment={reply}
            discussion={discussion}
            setReplyMention={setReplyMention}
            viewer={viewer}
          />
        )
      })}
    </>
  )
}

export default ThreadedRepliesList
