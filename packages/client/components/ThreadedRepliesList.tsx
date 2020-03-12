import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedRepliesList_meeting} from '__generated__/ThreadedRepliesList_meeting.graphql'
import {ThreadedRepliesList_replies} from '__generated__/ThreadedRepliesList_replies.graphql'
import ThreadedReplyComment from './ThreadedReplyComment'
import ThreadedTask from './ThreadedTask'
import {SetReplyMention} from './ThreadedItem'
import ThreadedCommentBase from './ThreadedCommentBase'
import ThreadedTaskBase from './ThreadedTaskBase'

interface Props {
  meeting: ThreadedRepliesList_meeting
  reflectionGroupId: string
  replies: ThreadedRepliesList_replies
  setReplyMention: SetReplyMention
}

const ThreadedRepliesList = (props: Props) => {
  const {replies, setReplyMention, meeting, reflectionGroupId} = props
  return (
    <>
      {replies.map((reply) => {
        const {__typename, id} = reply
        return __typename === 'Task' ? (
          <ThreadedTaskBase
            key={id}
            isReply
            task={reply}
            meeting={meeting}
            reflectionGroupId={reflectionGroupId}
            setReplyMention={setReplyMention}
          />
        ) : (
          <ThreadedCommentBase
            key={id}
            isReply
            comment={reply}
            meeting={meeting}
            reflectionGroupId={reflectionGroupId}
            setReplyMention={setReplyMention}
          />
        )
      })}
    </>
  )
}

export default createFragmentContainer(ThreadedRepliesList, {
  meeting: graphql`
    fragment ThreadedRepliesList_meeting on RetrospectiveMeeting {
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
