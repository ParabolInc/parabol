import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw, EditorState, SelectionState} from 'draft-js'
import useAtmosphere from 'hooks/useAtmosphere'
import useEditorState from 'hooks/useEditorState'
import useMutationProps from 'hooks/useMutationProps'
import AddReactjiToReactableMutation from 'mutations/AddReactjiToReactableMutation'
import UpdateCommentContentMutation from 'mutations/UpdateCommentContentMutation'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ReactableEnum} from 'types/graphql'
import convertToTaskContent from 'utils/draftjs/convertToTaskContent'
import isAndroid from 'utils/draftjs/isAndroid'
import isTempId from 'utils/relay/isTempId'
import {ThreadedComment_comment} from '__generated__/ThreadedComment_comment.graphql'
import {ThreadedComment_meeting} from '__generated__/ThreadedComment_meeting.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import CommentEditor from './TaskEditor/CommentEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedCommentFooter from './ThreadedCommentFooter'
import ThreadedCommentHeader from './ThreadedCommentHeader'
import ThreadedCommentReply from './ThreadedCommentReply'

const Wrapper = styled('div')({
  display: 'flex',
  width: '100%'
})

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%'
})

interface Props {
  comment: ThreadedComment_comment
  meeting: ThreadedComment_meeting
  isReplying: boolean
  reflectionGroupId: string
  setReplyingToComment: (commentId: string) => void
}

export const ANONYMOUS_COMMENT_USER = {
  picture: anonymousAvatar,
  preferredName: 'Anonymous'
}

const ThreadedComment = (props: Props) => {
  const {comment, reflectionGroupId, isReplying, setReplyingToComment, meeting} = props
  const {teamId} = meeting
  const {id: commentId, content, createdByUser, reactjis} = comment
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
    setReplyingToComment(commentId)
    setImmediate(() => {
      ref.current?.scrollIntoView({behavior: 'smooth'})
      replyEditorRef.current?.focus()
    })
  }

  return (
    <Wrapper ref={ref}>
      <ThreadedAvatarColumn picture={picture} />
      <BodyCol>
        <ThreadedCommentHeader
          comment={comment}
          isReplying={isReplying}
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
          submitComment={submitComment}
          readOnly={!isEditing}
          placeholder={'Edit your comment'}
        />
        <ThreadedCommentFooter
          isReplying={isReplying}
          reactjis={reactjis}
          onToggleReactji={onToggleReactji}
          onReply={onReply}
        />
        <ThreadedCommentReply
          isReplying={isReplying}
          reflectionGroupId={reflectionGroupId}
          setReplyingToComment={setReplyingToComment}
          meeting={meeting}
          editorRef={replyEditorRef}
        />
      </BodyCol>
    </Wrapper>
  )
}

export default createFragmentContainer(ThreadedComment, {
  meeting: graphql`
    fragment ThreadedComment_meeting on RetrospectiveMeeting {
      ...DiscussionThreadInput_meeting
      ...ThreadedCommentReply_meeting
      teamId
    }
  `,
  comment: graphql`
    fragment ThreadedComment_comment on Comment {
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
    }
  `
})
