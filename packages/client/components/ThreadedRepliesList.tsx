import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedRepliesList_meeting} from '__generated__/ThreadedRepliesList_meeting.graphql'
import {ThreadedRepliesList_replies} from '__generated__/ThreadedRepliesList_replies.graphql'
import ThreadedReplyComment from './ThreadedReplyComment'
import ThreadedTask from './ThreadedTask'
import {SetReplyMention} from './ThreadedComment'

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
          <ThreadedTask key={id} task={reply} />
        ) : (
          <ThreadedReplyComment
            key={id}
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
      ...ThreadedReplyComment_meeting
    }
  `,
  replies: graphql`
    fragment ThreadedRepliesList_replies on Threadable @relay(plural: true) {
      ...ThreadedTask_task
      ...ThreadedReplyComment_comment
      __typename
      id
    }
  `
})
