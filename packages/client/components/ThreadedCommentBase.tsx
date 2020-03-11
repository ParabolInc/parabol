import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw, EditorState, SelectionState} from 'draft-js'
import useAtmosphere from 'hooks/useAtmosphere'
import useEditorState from 'hooks/useEditorState'
import useMutationProps from 'hooks/useMutationProps'
import AddReactjiToReactableMutation from 'mutations/AddReactjiToReactableMutation'
import UpdateCommentContentMutation from 'mutations/UpdateCommentContentMutation'
import React, {ReactNode, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ReactableEnum} from 'types/graphql'
import convertToTaskContent from 'utils/draftjs/convertToTaskContent'
import isAndroid from 'utils/draftjs/isAndroid'
import isTempId from 'utils/relay/isTempId'
import {ThreadedCommentBase_comment} from '__generated__/ThreadedCommentBase_comment.graphql'
import {ThreadedCommentBase_meeting} from '__generated__/ThreadedCommentBase_meeting.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import CommentEditor from './TaskEditor/CommentEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedCommentFooter from './ThreadedCommentFooter'
import ThreadedCommentHeader from './ThreadedCommentHeader'
import ThreadedCommentReply from './ThreadedCommentReply'

const Wrapper = styled('div')<{isReply: boolean}>(({isReply}) => ({
  display: 'flex',
  // marginLeft: isReply ? -12 : undefined,
  marginTop: isReply ? 8 : undefined,
  width: '100%'
}))

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%'
})

interface Props {
  comment: ThreadedCommentBase_comment
  children?: ReactNode // the replies, listed here to avoid a circular reference
  meeting: ThreadedCommentBase_meeting
  isReply?: boolean // this comment is a reply & should be indented
  isReplying: boolean // the replying input is currently open
  reflectionGroupId: string
  setReplyingToComment?: (commentId: string) => void
}

export const ANONYMOUS_COMMENT_USER = {
  picture: anonymousAvatar,
  preferredName: 'Anonymous'
}

const ThreadedCommentBase = (props: Props) => {
  const {children, comment, reflectionGroupId, isReplying, setReplyingToComment, meeting} = props
  const isReply = !!props.isReply
  const {teamId} = meeting
  const {id: commentId, content, createdByUser, reactjis, replies} = comment
  const {picture} = createdByUser || ANONYMOUS_COMMENT_USER
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const replyEditorRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const atmosphere = useAtmosphere()

  const submitComment = () => {
    if (isTempId(commentId)) return
    if (isAndroid) {
      const editorEl = editorRef.current
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      const initialContentState = editorState.getCurrentContent()
      const initialText = initialContentState.getPlainText()
      if (initialText === value) return
      submitMutation()
      UpdateCommentContentMutation(
        atmosphere,
        {commentId, content: convertToTaskContent(value)},
        {onError, onCompleted}
      )
      setIsEditing(false)
      return
    }
    const contentState = editorState.getCurrentContent()
    const nextContent = JSON.stringify(convertToRaw(contentState))
    if (content === nextContent) return
    submitMutation()
    UpdateCommentContentMutation(
      atmosphere,
      {commentId, content: nextContent},
      {onError, onCompleted}
    )
    setIsEditing(false)
  }

  const handleSubmitFallback = () => {}
  const editComment = () => {
    setIsEditing(true)
    setImmediate(() => {
      const selection = editorState.getSelection()
      const contentState = editorState.getCurrentContent()
      const fullSelection = (selection as any).merge({
        anchorKey: contentState.getLastBlock().getKey(),
        focusKey: contentState.getLastBlock().getKey(),
        anchorOffset: contentState.getLastBlock().getLength(),
        focusOffset: contentState.getLastBlock().getLength()
      }) as SelectionState
      const nextEditorState = EditorState.forceSelection(editorState, fullSelection)
      setEditorState(nextEditorState)
      editorRef.current?.focus()
    })
  }

  const onToggleReactji = (emojiId: string) => {
    if (submitting) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && reactji.id.split(':')[1] === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {reactableType: ReactableEnum.COMMENT, reactableId: commentId, isRemove, reactji: emojiId},
      {onCompleted, onError}
    )
    // when the reactjis move to the bottom & increase the height, make sure they're visible
    setImmediate(() => ref.current?.scrollIntoView({behavior: 'smooth'}))
  }

  const onReply = () => {
    setReplyingToComment?.(commentId)
    setImmediate(() => {
      ref.current?.scrollIntoView({behavior: 'smooth'})
      replyEditorRef.current?.focus()
    })
  }

  const getMaxSortOrder = () => {
    return replies ? Math.max(0, ...replies.map((reply) => reply.threadSortOrder || 0)) : 0
  }

  return (
    <Wrapper isReply={isReply} ref={ref}>
      <ThreadedAvatarColumn picture={picture} />
      <BodyCol>
        <ThreadedCommentHeader
          comment={comment}
          isReplying={isReplying || isReply}
          editComment={editComment}
          onToggleReactji={onToggleReactji}
          onReply={onReply}
        />
        <CommentEditor
          editorRef={editorRef}
          teamId={teamId}
          editorState={editorState}
          handleSubmitFallback={handleSubmitFallback}
          setEditorState={setEditorState}
          onBlur={submitComment}
          submitComment={submitComment}
          readOnly={!isEditing}
          placeholder={'Edit your comment'}
        />
        <ThreadedCommentFooter
          isReplying={isReplying || isReply}
          reactjis={reactjis}
          onToggleReactji={onToggleReactji}
          onReply={onReply}
        />
        {children}
        <ThreadedCommentReply
          commentId={commentId}
          getMaxSortOrder={getMaxSortOrder}
          isReplying={isReply ? false : isReplying}
          reflectionGroupId={reflectionGroupId}
          setReplyingToComment={setReplyingToComment}
          meeting={meeting}
          editorRef={replyEditorRef}
        />
      </BodyCol>
    </Wrapper>
  )
}

export default createFragmentContainer(ThreadedCommentBase, {
  meeting: graphql`
    fragment ThreadedCommentBase_meeting on RetrospectiveMeeting {
      ...DiscussionThreadInput_meeting
      ...ThreadedCommentReply_meeting
      teamId
    }
  `,
  comment: graphql`
    fragment ThreadedCommentBase_comment on Comment {
      ...ThreadedCommentHeader_comment
      id
      content
      createdByUser {
        picture
      }
      reactjis {
        ...ThreadedCommentFooter_reactjis
        id
        isViewerReactji
      }
      replies {
        id
      }
    }
  `
})
