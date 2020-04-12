import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedItem_meeting} from 'parabol-client/src/__generated__/ThreadedItem_meeting.graphql'
import {ThreadedItem_threadable} from 'parabol-client/src/__generated__/ThreadedItem_threadable.graphql'
import ThreadedCommentBase from './ThreadedCommentBase'
import ThreadedRepliesList from './ThreadedRepliesList'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  threadable: ThreadedItem_threadable
  meeting: ThreadedItem_meeting
  reflectionGroupId: string
}

export type ReplyMention = {
  userId: string
  preferredName: string
} | null

export type SetReplyMention = (replyMention: ReplyMention) => void

export const ThreadedItem = (props: Props) => {
  const {threadable, reflectionGroupId, meeting} = props
  const {__typename, replies} = threadable
  const [replyMention, setReplyMention] = useState<ReplyMention>(null)
  if (!replies) debugger
  const child = (
    <ThreadedRepliesList
      meeting={meeting}
      replies={replies}
      reflectionGroupId={reflectionGroupId}
      setReplyMention={setReplyMention}
    />
  )
  if (__typename === 'Task') {
    return (
      <ThreadedTaskBase
        task={threadable}
        meeting={meeting}
        reflectionGroupId={reflectionGroupId}
        replyMention={replyMention}
        setReplyMention={setReplyMention}
      >
        {child}
      </ThreadedTaskBase>
    )
  }
  return (
    <ThreadedCommentBase
      comment={threadable}
      meeting={meeting}
      reflectionGroupId={reflectionGroupId}
      replyMention={replyMention}
      setReplyMention={setReplyMention}
    >
      {child}
    </ThreadedCommentBase>
  )
}

export default createFragmentContainer(ThreadedItem, {
  meeting: graphql`
    fragment ThreadedItem_meeting on RetrospectiveMeeting {
      ...ThreadedCommentBase_meeting
      ...ThreadedTaskBase_meeting
      ...ThreadedRepliesList_meeting
    }
  `,
  threadable: graphql`
    fragment ThreadedItem_threadable on Threadable {
      ...ThreadedCommentBase_comment
      ...ThreadedTaskBase_task
      __typename
      replies {
        ...ThreadedRepliesList_replies
      }
    }
  `
})
