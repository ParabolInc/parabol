import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {
  ThreadedCommentHeader_comment$data,
  ThreadedCommentHeader_comment$key
} from '~/__generated__/ThreadedCommentHeader_comment.graphql'
import relativeDate from '~/utils/date/relativeDate'
import {cn} from '../ui/cn'
import {PARABOL_AI_USER_ID} from '../utils/constants'
import CommentAuthorOptionsButton from './CommentAuthorOptionsButton'
import AddReactjiButton from './ReflectionCard/AddReactjiButton'
import ThreadedItemHeaderDescription from './ThreadedItemHeaderDescription'
import ThreadedReplyButton from './ThreadedReplyButton'

interface Props {
  comment: ThreadedCommentHeader_comment$key
  editComment: () => void
  onToggleReactji: (emojiId: string) => void
  onReply: () => void
  meetingId: string
}

const getName = (comment: ThreadedCommentHeader_comment$data) => {
  const {isActive, createdByUserNullable, isViewerComment} = comment
  if (!isActive) return 'Message Deleted'
  if (createdByUserNullable?.preferredName) return createdByUserNullable.preferredName
  return isViewerComment ? 'Anonymous (You)' : 'Anonymous'
}

const ThreadedCommentHeader = (props: Props) => {
  const {comment: commentRef, onReply, editComment, onToggleReactji, meetingId} = props
  const comment = useFragment(
    graphql`
      fragment ThreadedCommentHeader_comment on Comment {
        id
        createdByUserNullable: createdByUser {
          id
          preferredName
        }
        isActive
        isViewerComment
        reactjis {
          id
        }
        updatedAt
      }
    `,
    commentRef
  )
  const {
    id: commentId,
    isActive,
    isViewerComment,
    reactjis,
    updatedAt,
    createdByUserNullable
  } = comment
  const isAIComment = createdByUserNullable?.id === PARABOL_AI_USER_ID
  const name = getName(comment)
  const hasReactjis = reactjis.length > 0
  const isEditable = isViewerComment || isAIComment
  return (
    <ThreadedItemHeaderDescription title={name} subTitle={relativeDate(updatedAt)}>
      {isActive && (
        <div className={cn('flex font-semibold text-fg-secondary', isEditable ? 'pr-2' : 'pr-8')}>
          {!hasReactjis && (
            <>
              <AddReactjiButton className='mr-1 flex' onToggle={onToggleReactji} />
              <ThreadedReplyButton onReply={onReply} />
            </>
          )}
          {isEditable && (
            <CommentAuthorOptionsButton
              editComment={editComment}
              commentId={commentId}
              meetingId={meetingId}
            />
          )}
        </div>
      )}
    </ThreadedItemHeaderDescription>
  )
}

export default ThreadedCommentHeader
