import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ThreadedComment_comment} from '__generated__/ThreadedComment_comment.graphql'
import {ThreadedComment_meeting} from '__generated__/ThreadedComment_meeting.graphql'
import ThreadedCommentBase from './ThreadedCommentBase'
import ThreadedRepliesList from './ThreadedRepliesList'

interface Props {
  comment: ThreadedComment_comment
  meeting: ThreadedComment_meeting
  reflectionGroupId: string
}

export type ReplyMention = {
  userId: string
  preferredName: string
} | null

export type SetReplyMention = (replyMention: ReplyMention) => void

export const ThreadedComment = (props: Props) => {
  const {comment, reflectionGroupId, meeting} = props
  const {replies} = comment
  const [replyMention, setReplyMention] = useState<ReplyMention>(null)

  return (
    <ThreadedCommentBase
      comment={comment}
      meeting={meeting}
      reflectionGroupId={reflectionGroupId}
      replyMention={replyMention}
      setReplyMention={setReplyMention}
    >
      <ThreadedRepliesList
        meeting={meeting}
        replies={replies}
        reflectionGroupId={reflectionGroupId}
        setReplyMention={setReplyMention}
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
