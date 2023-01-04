import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw, EditorState} from 'draft-js'
import React, {ReactNode, useEffect, useRef, useState} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useEditorState from '~/hooks/useEditorState'
import useMutationProps from '~/hooks/useMutationProps'
import AddReactjiToReactableMutation from '~/mutations/AddReactjiToReactableMutation'
import UpdateCommentContentMutation from '~/mutations/UpdateCommentContentMutation'
import convertToTaskContent from '~/utils/draftjs/convertToTaskContent'
import isAndroid from '~/utils/draftjs/isAndroid'
import isTempId from '~/utils/relay/isTempId'
import {ThreadedCommentBase_comment} from '~/__generated__/ThreadedCommentBase_comment.graphql'
import {ThreadedCommentBase_discussion} from '~/__generated__/ThreadedCommentBase_discussion.graphql'
import {ThreadedCommentBase_viewer} from '~/__generated__/ThreadedCommentBase_viewer.graphql'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import deletedAvatar from '../styles/theme/images/deleted-avatar-placeholder.svg'
import {PARABOL_AI_USER_ID} from '../utils/constants'
import {DiscussionThreadables} from './DiscussionThreadList'
import CommentEditor from './TaskEditor/CommentEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import ThreadedCommentFooter from './ThreadedCommentFooter'
import ThreadedCommentHeader from './ThreadedCommentHeader'
import {ReplyMention, SetReplyMention} from './ThreadedItem'
import ThreadedItemReply from './ThreadedItemReply'
import ThreadedItemWrapper from './ThreadedItemWrapper'
import useFocusedReply from './useFocusedReply'

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: 'calc(100% - 56px)'
})

const EditorWrapper = styled('div')({
  paddingRight: 16
})

interface Props {
  allowedThreadables: DiscussionThreadables[]
  comment: ThreadedCommentBase_comment
  children?: ReactNode // the replies, listed here to avoid a circular reference
  discussion: ThreadedCommentBase_discussion
  isReply?: boolean // this comment is a reply & should be indented
  setReplyMention: SetReplyMention
  replyMention?: ReplyMention
  dataCy: string
  viewer: ThreadedCommentBase_viewer
}

const ThreadedCommentBase = (props: Props) => {
  const {
    allowedThreadables,
    children,
    comment,
    replyMention,
    setReplyMention,
    discussion,
    dataCy,
    viewer
  } = props
  const isReply = !!props.isReply
  const {id: discussionId, meetingId, replyingToCommentId, teamId, discussionTopicId} = discussion
  const {
    id: commentId,
    content,
    createdByUserNullable,
    isActive,
    reactjis,
    threadParentId
  } = comment
  const ownerId = threadParentId || commentId
  const picture = isActive ? createdByUserNullable?.picture ?? anonymousAvatar : deletedAvatar
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const replyEditorRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const atmosphere = useAtmosphere()
  useFocusedReply(ownerId, replyingToCommentId, ref, replyEditorRef)
  const editComment = () => {
    setIsEditing(true)
    setImmediate(() => {
      setEditorState(EditorState.moveFocusToEnd(editorState))
      editorRef.current?.focus()
    })
  }

  useEffect(() => {
    if (createdByUserNullable?.id === PARABOL_AI_USER_ID) {
      const contentState = editorState.getCurrentContent()
      const summary = contentState.getPlainText()
      SendClientSegmentEventMutation(atmosphere, 'AI Summary Viewed', {
        source: 'Discussion',
        tier: viewer.tier,
        meetingId,
        discussionTopicId,
        summary
      })
    }
  }, [])

  const onToggleReactji = (emojiId: string) => {
    if (submitting) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && reactji.id.split(':')[1] === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableType: 'COMMENT',
        reactableId: commentId,
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
    // when the reactjis move to the bottom & increase the height, make sure they're visible
    setImmediate(() => ref.current?.scrollIntoView({behavior: 'smooth'}))
  }

  const onReply = () => {
    if (createdByUserNullable && threadParentId) {
      const {id: userId, preferredName} = createdByUserNullable
      setReplyMention({userId, preferredName})
    }

    commitLocalUpdate(atmosphere, (store) => {
      store
        .getRoot()
        .getLinkedRecord('viewer')
        ?.getLinkedRecord('discussion', {id: discussionId})
        ?.setValue(ownerId, 'replyingToCommentId')
    })
  }

  const ensureHasText = (value: string) => value.trim().length

  const onSubmit = () => {
    if (submitting || isTempId(commentId)) return
    const editorEl = editorRef.current
    if (isAndroid) {
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!ensureHasText(value)) return
      const initialContentState = editorState.getCurrentContent()
      const initialText = initialContentState.getPlainText()
      setIsEditing(false)
      if (initialText === value) return
      submitMutation()
      UpdateCommentContentMutation(
        atmosphere,
        {commentId, content: convertToTaskContent(value), meetingId},
        {onError, onCompleted}
      )
      return
    }
    const contentState = editorState.getCurrentContent()
    if (!ensureHasText(contentState.getPlainText())) return
    const nextContent = JSON.stringify(convertToRaw(contentState))
    setIsEditing(false)
    if (content === nextContent) return
    submitMutation()
    UpdateCommentContentMutation(
      atmosphere,
      {commentId, content: nextContent, meetingId},
      {onError, onCompleted}
    )
  }

  return (
    <ThreadedItemWrapper data-cy={`${dataCy}-wrapper`} isReply={isReply} ref={ref}>
      <ThreadedAvatarColumn isReply={isReply} picture={picture} />
      <BodyCol>
        <ThreadedCommentHeader
          dataCy={dataCy}
          comment={comment}
          editComment={editComment}
          meetingId={meetingId}
          onToggleReactji={onToggleReactji}
          onReply={onReply}
        />
        {isActive && (
          <EditorWrapper>
            <CommentEditor
              dataCy={`${dataCy}`}
              editorRef={editorRef}
              teamId={teamId}
              editorState={editorState}
              setEditorState={setEditorState}
              onBlur={onSubmit}
              onSubmit={onSubmit}
              readOnly={!isEditing}
              placeholder={'Edit your comment'}
            />
          </EditorWrapper>
        )}
        {isActive && (
          <ThreadedCommentFooter
            reactjis={reactjis}
            onToggleReactji={onToggleReactji}
            onReply={onReply}
          />
        )}
        {children}
        <ThreadedItemReply
          allowedThreadables={allowedThreadables}
          dataCy={`${dataCy}-reply`}
          discussion={discussion}
          editorRef={replyEditorRef}
          replyMention={replyMention}
          setReplyMention={setReplyMention}
          threadable={comment}
          viewer={viewer}
        />
      </BodyCol>
    </ThreadedItemWrapper>
  )
}

export default createFragmentContainer(ThreadedCommentBase, {
  viewer: graphql`
    fragment ThreadedCommentBase_viewer on User {
      ...ThreadedItemReply_viewer
      tier
    }
  `,
  discussion: graphql`
    fragment ThreadedCommentBase_discussion on Discussion {
      ...DiscussionThreadInput_discussion
      ...ThreadedItemReply_discussion
      id
      meetingId
      replyingToCommentId
      teamId
      discussionTopicId
    }
  `,
  comment: graphql`
    fragment ThreadedCommentBase_comment on Comment {
      ...ThreadedCommentHeader_comment
      ...ThreadedItemReply_threadable
      id
      isActive
      content
      createdByUserNullable: createdByUser {
        id
        preferredName
        picture
      }
      reactjis {
        ...ThreadedCommentFooter_reactjis
        id
        isViewerReactji
      }
      threadParentId
    }
  `
})
