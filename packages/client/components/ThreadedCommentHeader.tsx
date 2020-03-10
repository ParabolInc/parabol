import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import relativeDate from 'utils/date/relativeDate'
import {ThreadedCommentHeader_comment} from '__generated__/ThreadedCommentHeader_comment.graphql'
import CommentAuthorOptionsButton from './CommentAuthorOptionsButton'
import AddReactjiButton from './ReflectionCard/AddReactjiButton'
import {ANONYMOUS_COMMENT_USER} from './ThreadedComment'
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

const HeaderActions = styled('div')({
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  fontWeight: 600,
  paddingRight: 12
})

interface Props {
  comment: ThreadedCommentHeader_comment
  isReplying: boolean
  editComment: () => void
  onToggleReactji: (emojiId: string) => void
  onReply: () => void
}

const ThreadedComment = (props: Props) => {
  const {comment, isReplying, onReply, editComment, onToggleReactji} = props
  const {id: commentId, createdByUser, isViewerComment, reactjis, updatedAt} = comment
  const {preferredName} = createdByUser || ANONYMOUS_COMMENT_USER
  const hasReactjis = reactjis.length > 0
  return (
    <Header>
      <HeaderDescription>
        <HeaderName>{preferredName}</HeaderName>
        <HeaderResult> {relativeDate(updatedAt)}</HeaderResult>
      </HeaderDescription>
      <HeaderActions>
        {!hasReactjis && (
          <>
            <AddReactjiButton onToggle={onToggleReactji} />
            <ThreadedReplyButton onReply={onReply} isReplying={isReplying} />
          </>
        )}
        {isViewerComment && (
          <CommentAuthorOptionsButton editComment={editComment} commentId={commentId} />
        )}
      </HeaderActions>
    </Header>
  )
}

export default createFragmentContainer(ThreadedComment, {
  comment: graphql`
    fragment ThreadedCommentHeader_comment on Comment {
      id
      createdByUser {
        preferredName
      }
      isViewerComment
      reactjis {
        id
      }
      updatedAt
    }
  `
})
