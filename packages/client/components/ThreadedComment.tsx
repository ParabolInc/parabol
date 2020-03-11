import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedComment_comment} from '__generated__/ThreadedComment_comment.graphql'
import {ThreadedComment_meeting} from '__generated__/ThreadedComment_meeting.graphql'
import ThreadedCommentBase from './ThreadedCommentBase'
import ThreadedRepliesList from './ThreadedRepliesList'

interface Props {
  comment: ThreadedComment_comment
  meeting: ThreadedComment_meeting
  isReplying: boolean // the replying input is currently open
  reflectionGroupId: string
  setReplyingToComment: (commentId: string) => void
}

export const ThreadedComment = (props: Props) => {
  const {comment, reflectionGroupId, isReplying, setReplyingToComment, meeting} = props
  const {replies} = comment
  return (
    <ThreadedCommentBase
      comment={comment}
      meeting={meeting}
      isReplying={isReplying}
      reflectionGroupId={reflectionGroupId}
      setReplyingToComment={setReplyingToComment}
    >
      <ThreadedRepliesList
        meeting={meeting}
        replies={replies}
        reflectionGroupId={reflectionGroupId}
      />
    </ThreadedCommentBase>
  )
}

export default createFragmentContainer(ThreadedComment, {
  meeting: graphql`
    fragment ThreadedComment_meeting on RetrospectiveMeeting {
      ...ThreadedCommentBase_meeting
      ...ThreadedRepliesList_meeting
    }
  `,
  comment: graphql`
    fragment ThreadedComment_comment on Comment {
      ...ThreadedCommentBase_comment
      replies {
        ...ThreadedRepliesList_replies
      }
    }
  `
})
