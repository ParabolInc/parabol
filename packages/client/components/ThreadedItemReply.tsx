import graphql from 'babel-plugin-relay/macro'
import {Editor} from 'draft-js'
import React, {RefObject, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useClickAway from '~/hooks/useClickAway'
import isAndroid from '~/utils/draftjs/isAndroid'
import {ThreadedItemReply_discussion$key} from '~/__generated__/ThreadedItemReply_discussion.graphql'
import {ThreadedItemReply_threadable$key} from '~/__generated__/ThreadedItemReply_threadable.graphql'
import {ThreadedItemReply_viewer$key} from '~/__generated__/ThreadedItemReply_viewer.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'
import {DiscussionThreadables} from './DiscussionThreadList'
import {ReplyMention, SetReplyMention} from './ThreadedItem'

interface Props {
  allowedThreadables: DiscussionThreadables[]
  threadable: ThreadedItemReply_threadable$key
  editorRef: RefObject<HTMLTextAreaElement>
  discussion: ThreadedItemReply_discussion$key
  viewer: ThreadedItemReply_viewer$key
  replyMention?: ReplyMention
  setReplyMention: SetReplyMention
  dataCy: string
}

const ThreadedItemReply = (props: Props) => {
  const {
    allowedThreadables,
    replyMention,
    threadable: threadableRef,
    editorRef,
    discussion: discussionRef,
    setReplyMention,
    dataCy,
    viewer: viewerRef
  } = props
  const viewer = useFragment(
    graphql`
      fragment ThreadedItemReply_viewer on User {
        ...DiscussionThreadInput_viewer
      }
    `,
    viewerRef
  )
  const threadable = useFragment(
    graphql`
      fragment ThreadedItemReply_threadable on Threadable {
        id
        replies {
          id
          threadSortOrder
        }
      }
    `,
    threadableRef
  )
  const discussion = useFragment(
    graphql`
      fragment ThreadedItemReply_discussion on Discussion {
        ...DiscussionThreadInput_discussion
        id
        replyingToCommentId
      }
    `,
    discussionRef
  )
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

export default ThreadedItemReply
