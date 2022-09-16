import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedItem_discussion} from '~/__generated__/ThreadedItem_discussion.graphql'
import {ThreadedItem_threadable} from '~/__generated__/ThreadedItem_threadable.graphql'
import {ThreadedItem_viewer} from '~/__generated__/ThreadedItem_viewer.graphql'
import {DiscussionThreadables} from './DiscussionThreadList'
import ThreadedCommentBase from './ThreadedCommentBase'
import ThreadedPollBase from './ThreadedPollBase'
import ThreadedRepliesList from './ThreadedRepliesList'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  threadable: ThreadedItem_threadable
  discussion: ThreadedItem_discussion
  viewer: ThreadedItem_viewer
}

export type ReplyMention = {
  userId: string
  preferredName: string
} | null

export type SetReplyMention = (replyMention: ReplyMention) => void

export const ThreadedItem = (props: Props) => {
  const {allowedThreadables, threadable, discussion, viewer} = props
  const {__typename, replies} = threadable
  const [replyMention, setReplyMention] = useState<ReplyMention>(null)
  const child = (
    <ThreadedRepliesList
      allowedThreadables={allowedThreadables}
      dataCy={`child`}
      discussion={discussion}
      replies={replies}
      setReplyMention={setReplyMention}
      viewer={viewer}
    />
  )
  if (__typename === 'Task') {
    return (
      <ThreadedTaskBase
        allowedThreadables={allowedThreadables}
        dataCy={`task`}
        task={threadable}
        discussion={discussion}
        replyMention={replyMention}
        setReplyMention={setReplyMention}
        viewer={viewer}
      >
        {child}
      </ThreadedTaskBase>
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
      dataCy={`comment`}
      comment={threadable}
      discussion={discussion}
      replyMention={replyMention}
      setReplyMention={setReplyMention}
      viewer={viewer}
    >
      {child}
    </ThreadedCommentBase>
  )
}

export default createFragmentContainer(ThreadedItem, {
  viewer: graphql`
    fragment ThreadedItem_viewer on User {
      ...ThreadedTaskBase_viewer
      ...ThreadedCommentBase_viewer
      ...ThreadedRepliesList_viewer
    }
  `,
  discussion: graphql`
    fragment ThreadedItem_discussion on Discussion {
      ...ThreadedCommentBase_discussion
      ...ThreadedTaskBase_discussion
      ...ThreadedPollBase_discussion
      ...ThreadedRepliesList_discussion
    }
  `,
  threadable: graphql`
    fragment ThreadedItem_threadable on Threadable {
      ...ThreadedCommentBase_comment
      ...ThreadedTaskBase_task
      ...ThreadedPollBase_poll
      __typename
      replies {
        ...ThreadedRepliesList_replies
      }
    }
  `
})
