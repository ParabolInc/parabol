import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedRepliesList_meeting} from '~/__generated__/ThreadedRepliesList_meeting.graphql'
import {ThreadedRepliesList_replies} from '~/__generated__/ThreadedRepliesList_replies.graphql'
import ThreadedCommentBase from './ThreadedCommentBase'
import {SetReplyMention} from './ThreadedItem'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  meeting: ThreadedRepliesList_meeting
  threadSourceId: string
  replies: ThreadedRepliesList_replies
  setReplyMention: SetReplyMention
  dataCy: string
}

const ThreadedRepliesList = (props: Props) => {
  const {replies, setReplyMention, meeting, threadSourceId, dataCy} = props
  // https://sentry.io/organizations/parabol/issues/1569570376/?project=107196&query=is%3Aunresolved
  // not sure why this is required addComment and createTask but request replies
  if (!replies) return null
  return (
    <>
      {replies.map((reply) => {
        const {__typename, id} = reply
        return __typename === 'Task' ? (
          <ThreadedTaskBase
            dataCy={`${dataCy}-task`}
            key={id}
            isReply
            task={reply}
            meeting={meeting}
            threadSourceId={threadSourceId}
            setReplyMention={setReplyMention}
          />
        ) : (
          <ThreadedCommentBase
            dataCy={`${dataCy}-comment`}
            key={id}
            isReply
            comment={reply}
            meeting={meeting}
            threadSourceId={threadSourceId}
            setReplyMention={setReplyMention}
          />
        )
      })}
    </>
  )
}

export default createFragmentContainer(ThreadedRepliesList, {
  meeting: graphql`
    fragment ThreadedRepliesList_meeting on NewMeeting {
      ...ThreadedCommentBase_meeting
      ...ThreadedTaskBase_meeting
    }
  `,
  replies: graphql`
    fragment ThreadedRepliesList_replies on Threadable @relay(plural: true) {
      ...ThreadedTaskBase_task
      ...ThreadedCommentBase_comment
      __typename
      id
    }
  `
})
