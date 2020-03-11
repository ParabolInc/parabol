import graphql from 'babel-plugin-relay/macro'
import {Editor} from 'draft-js'
import useClickAway from 'hooks/useClickAway'
import React, {RefObject, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import isAndroid from 'utils/draftjs/isAndroid'
import {ThreadedCommentReply_meeting} from '__generated__/ThreadedCommentReply_meeting.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'

interface Props {
  commentId: string
  editorRef: RefObject<HTMLTextAreaElement>
  getMaxSortOrder: () => number
  isReplying: boolean
  reflectionGroupId: string
  setReplyingToComment: (commentId: string) => void
  meeting: ThreadedCommentReply_meeting
}

const ThreadedCommentReply = (props: Props) => {
  const {
    commentId,
    editorRef,
    getMaxSortOrder,
    reflectionGroupId,
    isReplying,
    setReplyingToComment,
    meeting
  } = props
  const replyRef = useRef<HTMLTextAreaElement>(null)
  const onSubmitReply = () => {}

  const listeningRef = isReplying ? replyRef : null
  useClickAway(listeningRef, () => {
    const editorEl = editorRef.current
    if (!editorEl) return
    const hasText = isAndroid
      ? editorEl.value
      : ((editorEl as any) as Editor).props.editorState.getCurrentContent().hasText()
    if (!hasText) {
      setReplyingToComment('')
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
      onSubmit={onSubmitReply}
      reflectionGroupId={reflectionGroupId}
      threadParentId={commentId}
    />
  )
}

export default createFragmentContainer(ThreadedCommentReply, {
  meeting: graphql`
    fragment ThreadedCommentReply_meeting on RetrospectiveMeeting {
      ...DiscussionThreadInput_meeting
    }
  `
})
