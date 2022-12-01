import graphql from 'babel-plugin-relay/macro'
import {Editor} from 'draft-js'
import React, {RefObject, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useClickAway from '~/hooks/useClickAway'
import isAndroid from '~/utils/draftjs/isAndroid'
import {ThreadedItemReply_discussion} from '~/__generated__/ThreadedItemReply_discussion.graphql'
import {ThreadedItemReply_threadable} from '~/__generated__/ThreadedItemReply_threadable.graphql'
import {ThreadedItemReply_viewer} from '~/__generated__/ThreadedItemReply_viewer.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'
import {DiscussionThreadables} from './DiscussionThreadList'
import {ReplyMention, SetReplyMention} from './ThreadedItem'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  threadable: ThreadedItemReply_threadable
  editorRef: RefObject<HTMLTextAreaElement>
  discussion: ThreadedItemReply_discussion
  viewer: ThreadedItemReply_viewer
  replyMention?: ReplyMention
  setReplyMention: SetReplyMention
  dataCy: string
}

const ThreadedItemReply = (props: Props) => {
  const {
    allowedThreadables,
    replyMention,
    threadable,
    editorRef,
    discussion,
    setReplyMention,
    dataCy,
    viewer
  } = props
  const {id: threadableId, replies} = threadable
  const {id: discussionId, replyingToCommentId} = discussion
  const isReplying = replyingToCommentId === threadableId
  const replyRef = useRef<HTMLTextAreaElement>(null)
  const atmosphere = useAtmosphere()
  const clearReplyingToCommentId = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store
        .getRoot()
        .getLinkedRecord('viewer')
        ?.getLinkedRecord('discussion', {id: discussionId})
        ?.setValue('', 'replyingToCommentId')
    })
  }

  const listeningRef = isReplying ? replyRef : null
  useClickAway(listeningRef, () => {
    const editorEl = editorRef.current
    if (!editorEl) return
    const hasText = isAndroid
      ? editorEl.value
      : (editorEl as any as Editor).props.editorState.getCurrentContent().hasText()
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
      allowedThreadables={allowedThreadables}
      dataCy={`${dataCy}-input`}
      ref={replyRef}
      editorRef={editorRef}
      isReply
      replyMention={replyMention}
      getMaxSortOrder={getMaxSortOrder}
      discussion={discussion}
      onSubmitCommentSuccess={clearReplyingToCommentId}
      setReplyMention={setReplyMention}
      threadParentId={threadableId}
      viewer={viewer}
    />
  )
}

export default createFragmentContainer(ThreadedItemReply, {
  viewer: graphql`
    fragment ThreadedItemReply_viewer on User {
      ...DiscussionThreadInput_viewer
    }
  `,
  threadable: graphql`
    fragment ThreadedItemReply_threadable on Threadable {
      id
      replies {
        id
        threadSortOrder
      }
    }
  `,
  discussion: graphql`
    fragment ThreadedItemReply_discussion on Discussion {
      ...DiscussionThreadInput_discussion
      id
      replyingToCommentId
    }
  `
})
