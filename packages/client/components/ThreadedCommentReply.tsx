import graphql from 'babel-plugin-relay/macro'
import {Editor} from 'draft-js'
import useAtmosphere from 'hooks/useAtmosphere'
import useClickAway from 'hooks/useClickAway'
import React, {RefObject, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import isAndroid from 'utils/draftjs/isAndroid'
import {ThreadedCommentReply_meeting} from '__generated__/ThreadedCommentReply_meeting.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'

interface Props {
  commentId: string
  editorRef: RefObject<HTMLTextAreaElement>
  getMaxSortOrder: () => number
  reflectionGroupId: string
  meeting: ThreadedCommentReply_meeting
}

const ThreadedCommentReply = (props: Props) => {
  const {commentId, editorRef, getMaxSortOrder, reflectionGroupId, meeting} = props
  const {id: meetingId, replyingToCommentId} = meeting
  const isReplying = replyingToCommentId === commentId
  const replyRef = useRef<HTMLTextAreaElement>(null)
  const atmosphere = useAtmosphere()
  const clearReplyingToCommentId = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue('', 'replyingToCommentId')
    })
  }

  const listeningRef = isReplying ? replyRef : null
  useClickAway(listeningRef, () => {
    const editorEl = editorRef.current
    if (!editorEl) return
    const hasText = isAndroid
      ? editorEl.value
      : ((editorEl as any) as Editor).props.editorState.getCurrentContent().hasText()
    if (!hasText) {
      clearReplyingToCommentId()
    }
  })

  if (!isReplying) return null
  return (
    <DiscussionThreadInput
      ref={replyRef}
      editorRef={editorRef}
      isReply
      getMaxSortOrder={getMaxSortOrder}
      meeting={meeting}
      onSubmitSuccess={clearReplyingToCommentId}
      reflectionGroupId={reflectionGroupId}
      threadParentId={commentId}
    />
  )
}

export default createFragmentContainer(ThreadedCommentReply, {
  meeting: graphql`
    fragment ThreadedCommentReply_meeting on RetrospectiveMeeting {
      ...DiscussionThreadInput_meeting
      id
      replyingToCommentId
    }
  `
})
