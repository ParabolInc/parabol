import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {EditorState, SelectionState, Editor} from 'draft-js'
import useAtmosphere from 'hooks/useAtmosphere'
import useEditorState from 'hooks/useEditorState'
import useMutationProps from 'hooks/useMutationProps'
import AddReactjiToReactableMutation from 'mutations/AddReactjiToReactableMutation'
import React, {useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {ReactableEnum} from 'types/graphql'
import relativeDate from 'utils/date/relativeDate'
import {ThreadedComment_comment} from '__generated__/ThreadedComment_comment.graphql'
import {ThreadedComment_meeting} from '__generated__/ThreadedComment_meeting.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import CommentAuthorOptionsButton from './CommentAuthorOptionsButton'
import DiscussionThreadInput from './DiscussionThreadInput'
import AddReactjiButton from './ReflectionCard/AddReactjiButton'
import ReactjiSection from './ReflectionCard/ReactjiSection'
import CommentEditor from './TaskEditor/CommentEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import isAndroid from 'utils/draftjs/isAndroid'
import PlainButton from './PlainButton/PlainButton'

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

const Header = styled('div')({
  display: 'flex',
  fontSize: 12,
  justifyContent: 'space-between',
  lineHeight: '24px',
  paddingBottom: 8,
  width: '100%'
})

const HeaderDescription = styled('div')({
  display: 'flex'
})

const HeaderName = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontWeight: 600
})

const HeaderResult = styled('div')({
  color: PALETTE.TEXT_GRAY,
  whiteSpace: 'pre-wrap'
})

const HeaderActions = styled('div')({
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  fontWeight: 600,
  paddingRight: 12
})

const FooterActions = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  fontSize: 12,
  fontWeight: 600,
  paddingRight: 12
})

const Reply = styled(PlainButton)({
  fontWeight: 600,
  lineHeight: '24px'
})

const StyledReactjis = styled(ReactjiSection)({
  paddingLeft: 8
})

interface Props {
  comment: ThreadedComment_comment
  meeting: ThreadedComment_meeting
  isReplying: boolean
  reflectionGroupId: string
  setReplyingToComment: (commentId: string) => void
}

const ANONYMOUS_USER = {
  picture: anonymousAvatar,
  preferredName: 'Anonymous'
}

const ThreadedComment = (props: Props) => {
  const {comment, reflectionGroupId, isReplying, setReplyingToComment, meeting} = props
  const {teamId} = meeting
  const {id: commentId, content, createdByUser, isViewerComment, reactjis, updatedAt} = comment
  const {picture, preferredName} = createdByUser || ANONYMOUS_USER
  const hasReactjis = reactjis.length > 0
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const atmosphere = useAtmosphere()
  const submitComment = () => {}
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
  const replyToComment = () => {
    setReplyingToComment(commentId)
    setImmediate(() => {
      ref.current?.scrollIntoView({behavior: 'smooth'})
      replyEditorRef.current?.focus()
    })
  }

  const getMaxSortOrder = () => {
    return 0
  }

  const onSubmitReply = () => {}
  const replyEditorRef = useRef<HTMLTextAreaElement>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (!replyRef.current?.contains(target)) {
        const editorEl = replyEditorRef.current
        if (!editorEl) return
        const hasText = isAndroid
          ? editorEl.value
          : ((editorEl as any) as Editor).props.editorState.getCurrentContent().hasText()
        if (!hasText) {
          setReplyingToComment('')
        }
      }
    }
    if (isReplying) {
      document.addEventListener('click', handleDocumentClick)
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [isReplying])
  return (
    <Wrapper ref={ref}>
      <ThreadedAvatarColumn picture={picture} />
      <BodyCol>
        <Header>
          <HeaderDescription>
            <HeaderName>{preferredName}</HeaderName>
            <HeaderResult> {relativeDate(updatedAt)}</HeaderResult>
          </HeaderDescription>
          <HeaderActions>
            {!hasReactjis && (
              <>
                <AddReactjiButton onToggle={onToggleReactji} />
                {!isReplying && <Reply>Reply</Reply>}
              </>
            )}
            {isViewerComment && (
              <CommentAuthorOptionsButton editComment={editComment} commentId={commentId} />
            )}
          </HeaderActions>
        </Header>
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
        {hasReactjis && (
          <FooterActions>
            {!isReplying && <Reply onClick={replyToComment}>Reply</Reply>}
            <StyledReactjis reactjis={reactjis} onToggle={onToggleReactji} />
          </FooterActions>
        )}
        {isReplying && (
          <DiscussionThreadInput
            ref={replyRef}
            editorRef={replyEditorRef}
            isReply
            getMaxSortOrder={getMaxSortOrder}
            meeting={meeting}
            onSubmit={onSubmitReply}
            reflectionGroupId={reflectionGroupId}
          />
        )}
      </BodyCol>
    </Wrapper>
  )
}

export default createFragmentContainer(ThreadedComment, {
  meeting: graphql`
    fragment ThreadedComment_meeting on RetrospectiveMeeting {
      ...DiscussionThreadInput_meeting
      teamId
    }
  `,
  comment: graphql`
    fragment ThreadedComment_comment on Comment {
      id
      content
      createdByUser {
        picture
        preferredName
      }
      isViewerComment
      reactjis {
        ...ReactjiSection_reactjis
        id
        isViewerReactji
      }
      updatedAt
    }
  `
})
