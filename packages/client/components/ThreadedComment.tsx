import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useEditorState from 'hooks/useEditorState'
import useMutationProps from 'hooks/useMutationProps'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import relativeDate from 'utils/date/relativeDate'
import {ThreadedComment_comment} from '__generated__/ThreadedComment_comment.graphql'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import AddReactjiButton from './ReflectionCard/AddReactjiButton'
import CommentEditor from './TaskEditor/CommentEditor'
import ThreadedAvatarColumn from './ThreadedAvatarColumn'
import Icon from './Icon'
import AddReactjiToReactableMutation from 'mutations/AddReactjiToReactableMutation'
import {ReactableEnum} from 'types/graphql'
import useAtmosphere from 'hooks/useAtmosphere'

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

const StyledIcon = styled(Icon)({
  borderRadius: 24,
  color: PALETTE.TEXT_GRAY,
  display: 'block',
  flexShrink: 0,
  height: 24,
  lineHeight: '24px',
  marginLeft: 'auto',
  textAlign: 'center',
  width: 24
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
          {!isViewerComment ? (
            <StyledIcon>more_vert</StyledIcon>
          ) : hasReactjis ? null : (
            <HeaderActions>
              <AddReactjiButton onToggle={onToggleReactji} />
              Reply
            </HeaderActions>
          )}
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
        id
        isViewerReactji
      }
      updatedAt
    }
  `
})
