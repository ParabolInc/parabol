import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedRepliesList_meeting} from '__generated__/ThreadedRepliesList_meeting.graphql'
import {ThreadedRepliesList_replies} from '__generated__/ThreadedRepliesList_replies.graphql'
import ThreadedComment from './ThreadedComment'
import ThreadedTask from './ThreadedTask'
import ThreadedReplyComment from './ThreadedReplyComment'

interface Props {
  meeting: ThreadedRepliesList_meeting
  reflectionGroupId: string
  replies: ThreadedRepliesList_replies
}

const ThreadedRepliesList = (props: Props) => {
  const {replies, meeting, reflectionGroupId} = props
  return replies.map((reply) => {
    const {__typename, id} = reply
    return __typename === 'Task' ? (
      <ThreadedTask key={id} task={reply} />
    ) : (
      <ThreadedReplyComment
        key={id}
        comment={reply}
        meeting={meeting}
        reflectionGroupId={reflectionGroupId}
      />
    )
  })
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
