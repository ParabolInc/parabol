import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import relativeDate from 'utils/date/relativeDate'
import {ThreadedCommentHeader_comment} from '__generated__/ThreadedCommentHeader_comment.graphql'
import CommentAuthorOptionsButton from './CommentAuthorOptionsButton'
import AddReactjiButton from './ReflectionCard/AddReactjiButton'
import ThreadedReplyButton from './ThreadedReplyButton'

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

const HeaderActions = styled('div')<{isViewerComment: boolean}>(({isViewerComment}) => ({
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  fontWeight: 600,
  paddingRight: !isViewerComment ? 24 : undefined
}))

interface Props {
  comment: ThreadedCommentHeader_comment
  editComment: () => void
  onToggleReactji: (emojiId: string) => void
  onReply: () => void
}

const ThreadedCommentHeader = (props: Props) => {
  const {comment, onReply, editComment, onToggleReactji} = props
  const {id: commentId, createdByUser, isActive, isViewerComment, reactjis, updatedAt} = comment
  const name = isActive ? createdByUser?.preferredName ?? 'Anonymous' : 'Messaged Deleted'
  const hasReactjis = reactjis.length > 0
  return (
    <Header>
      <HeaderDescription>
        <HeaderName>{name}</HeaderName>
        <HeaderResult> {relativeDate(updatedAt)}</HeaderResult>
      </HeaderDescription>
      <HeaderActions isViewerComment={isViewerComment}>
        {!hasReactjis && (
          <>
            <AddReactjiButton onToggle={onToggleReactji} />
            <ThreadedReplyButton onReply={onReply} />
          </>
        )}
        {isViewerComment && (
          <CommentAuthorOptionsButton editComment={editComment} commentId={commentId} />
        )}
      </HeaderActions>
    </Header>
  )
}

export default createFragmentContainer(ThreadedCommentHeader, {
  comment: graphql`
    fragment ThreadedCommentHeader_comment on Comment {
      id
      createdByUser {
        preferredName
      }
      isActive
      isViewerComment
      reactjis {
        id
      }
      updatedAt
    }
  `
})
