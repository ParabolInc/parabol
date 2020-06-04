import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedItem_meeting} from '~/__generated__/ThreadedItem_meeting.graphql'
import {ThreadedItem_threadable} from '~/__generated__/ThreadedItem_threadable.graphql'
import ThreadedCommentBase from './ThreadedCommentBase'
import ThreadedRepliesList from './ThreadedRepliesList'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  threadable: ThreadedItem_threadable
  meeting: ThreadedItem_meeting
  threadSourceId: string
}

export type ReplyMention = {
  userId: string
  preferredName: string
} | null

export type SetReplyMention = (replyMention: ReplyMention) => void

export const ThreadedItem = (props: Props) => {
  const {threadable, threadSourceId, meeting} = props
  const {__typename, replies} = threadable
  const [replyMention, setReplyMention] = useState<ReplyMention>(null)
  if (!replies) debugger
  const child = (
    <ThreadedRepliesList
      dataCy={`child`}
      meeting={meeting}
      replies={replies}
      threadSourceId={threadSourceId}
      setReplyMention={setReplyMention}
    />
  )
  if (__typename === 'Task') {
    return (
      <ThreadedTaskBase
        dataCy={`task`}
        task={threadable}
        meeting={meeting}
        threadSourceId={threadSourceId}
        replyMention={replyMention}
        setReplyMention={setReplyMention}
      >
        {child}
      </ThreadedTaskBase>
    )
  }
  return (
    <ThreadedCommentBase
      dataCy={`comment`}
      comment={threadable}
      meeting={meeting}
      threadSourceId={threadSourceId}
      replyMention={replyMention}
      setReplyMention={setReplyMention}
    >
      {child}
    </ThreadedCommentBase>
  )
}

export default createFragmentContainer(ThreadedItem, {
  meeting: graphql`
    fragment ThreadedItem_meeting on NewMeeting {
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
