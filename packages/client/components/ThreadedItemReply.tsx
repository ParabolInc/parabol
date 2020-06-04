import graphql from 'babel-plugin-relay/macro'
import {Editor} from 'draft-js'
import React, {RefObject, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useClickAway from '~/hooks/useClickAway'
import isAndroid from '~/utils/draftjs/isAndroid'
import {ThreadedItemReply_meeting} from '~/__generated__/ThreadedItemReply_meeting.graphql'
import {ThreadedItemReply_threadable} from '~/__generated__/ThreadedItemReply_threadable.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'
import {ReplyMention, SetReplyMention} from './ThreadedItem'

interface Props {
  threadable: ThreadedItemReply_threadable
  editorRef: RefObject<HTMLTextAreaElement>
  threadSourceId: string
  meeting: ThreadedItemReply_meeting
  replyMention?: ReplyMention
  setReplyMention: SetReplyMention
  dataCy: string
}

const ThreadedItemReply = (props: Props) => {
  const {
    replyMention,
    threadable,
    editorRef,
    threadSourceId,
    meeting,
    setReplyMention,
    dataCy
  } = props
  const {id: threadableId, replies} = threadable
  const {id: meetingId, replyingToCommentId} = meeting
  const isReplying = replyingToCommentId === threadableId
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
  const getMaxSortOrder = () => {
    return replies ? Math.max(0, ...replies.map((reply) => reply.threadSortOrder || 0)) : 0
  }
  return (
    <DiscussionThreadInput
      dataCy={`${dataCy}-input`}
      ref={replyRef}
      editorRef={editorRef}
      isReply
      replyMention={replyMention}
      getMaxSortOrder={getMaxSortOrder}
      meeting={meeting}
      onSubmitCommentSuccess={clearReplyingToCommentId}
      threadSourceId={threadSourceId}
      setReplyMention={setReplyMention}
      threadParentId={threadableId}
    />
  )
}

export default createFragmentContainer(ThreadedItemReply, {
  threadable: graphql`
    fragment ThreadedItemReply_threadable on Threadable {
      id
      replies {
        id
        threadSortOrder
      }
    }
  `,
  meeting: graphql`
    fragment ThreadedItemReply_meeting on NewMeeting {
      ...DiscussionThreadInput_meeting
      id
      replyingToCommentId
    }
  `
})
