import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from 'hooks/useAtmosphere'
import useEditorState from 'hooks/useEditorState'
import useMutationProps from 'hooks/useMutationProps'
import AddReactjiToReactableMutation from 'mutations/AddReactjiToReactableMutation'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {ReactableEnum} from 'types/graphql'
import relativeDate from 'utils/date/relativeDate'
import {ThreadedComment_comment} from '__generated__/ThreadedComment_comment.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import CommentAuthorOptionsButton from './CommentAuthorOptionsButton'
import AddReactjiButton from './ReflectionCard/AddReactjiButton'
import ReactjiSection from './ReflectionCard/ReactjiSection'
import CommentEditor from './TaskEditor/CommentEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import {SelectionState, EditorState} from 'draft-js'

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

const Reply = styled('div')({
  lineHeight: '24px'
})

const StyledReactjis = styled(ReactjiSection)({
  paddingLeft: 8
})

interface Props {
  comment: ThreadedComment_comment
  teamId: string
}

const ANONYMOUS_USER = {
  picture: anonymousAvatar,
  preferredName: 'Anonymous'
}
const ThreadedComment = (props: Props) => {
  const {comment, teamId} = props
  const {id: commentId, content, createdByUser, isViewerComment, reactjis, updatedAt} = comment
  const {picture, preferredName} = createdByUser || ANONYMOUS_USER
  const hasReactjis = reactjis.length > 0
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
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
  }
  return (
    <Wrapper>
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
                <Reply>Reply</Reply>
              </>
            )}
            {isViewerComment && (
              <CommentAuthorOptionsButton editComment={editComment} commentId={commentId} />
            )}
          </HeaderActions>
        </Header>
        <CommentEditor
          teamId={teamId}
          editorRef={editorRef}
          editorState={editorState}
          handleSubmitFallback={handleSubmitFallback}
          setEditorState={setEditorState}
          submitComment={submitComment}
          readOnly={!isEditing}
          placeholder={'Edit your comment'}
        />
        {hasReactjis && (
          <FooterActions>
            <Reply>Reply</Reply>
            <StyledReactjis reactjis={reactjis} onToggle={onToggleReactji} />
          </FooterActions>
        )}
      </BodyCol>
    </Wrapper>
  )
}

export default createFragmentContainer(ThreadedComment, {
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
