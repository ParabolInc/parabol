import graphql from 'babel-plugin-relay/macro'
import {type ReactNode, useState} from 'react'
import {useFragment} from 'react-relay'
import type {PageCommentItem_comment$key} from '../../../__generated__/PageCommentItem_comment.graphql'
import {TipTapEditor} from '../../../components/TipTapEditor/TipTapEditor'
import deletedAvatar from '../../../styles/theme/images/deleted-avatar-placeholder.svg'
import {Avatar} from '../../../ui/Avatar/Avatar'
import {AvatarImage} from '../../../ui/Avatar/AvatarImage'
import {cn} from '../../../ui/cn'
import relativeDate from '../../../utils/date/relativeDate'
import {DeletePageCommentDialog} from './DeletePageCommentDialog'
import {PageCommentMenu} from './PageCommentMenu'
import {usePageCommentEditor} from './usePageCommentEditor'

interface Props {
  commentRef: PageCommentItem_comment$key
  viewerId: string
  isPageOwner: boolean
  isThreadStarter: boolean
  threadActions?: ReactNode
}

export const PageCommentItem = (props: Props) => {
  const {commentRef, viewerId, isPageOwner, isThreadStarter, threadActions} = props
  const comment = useFragment(
    graphql`
      fragment PageCommentItem_comment on PageComment {
        id
        content
        createdAt
        updatedAt
        createdBy
        createdByUser {
          preferredName
          picture
        }
      }
    `,
    commentRef
  )
  const {id: commentId, content, createdAt, updatedAt, createdBy, createdByUser} = comment
  const isViewerComment = createdBy === viewerId
  const [isDeleting, setIsDeleting] = useState(false)
  const {editor, isEditing, startEditing} = usePageCommentEditor(commentId, content)
  if (!editor) return null
  return (
    <div>
      <div className='flex items-center gap-2'>
        <Avatar className='size-6'>
          <AvatarImage src={createdByUser?.picture ?? deletedAvatar} alt='' />
        </Avatar>
        <div className='min-w-0 flex-1 leading-4'>
          <div className='truncate font-semibold text-fg-primary text-sm'>
            {createdByUser?.preferredName ?? 'Deleted user'}
          </div>
          <div className='text-fg-muted text-xs'>
            {relativeDate(createdAt)}
            {updatedAt !== createdAt && ' · Edited'}
          </div>
        </div>
        {threadActions}
        {(isViewerComment || isPageOwner) && (
          <PageCommentMenu
            isThreadStarter={isThreadStarter}
            onEdit={isViewerComment ? startEditing : undefined}
            onDelete={() => setIsDeleting(true)}
          />
        )}
      </div>
      <TipTapEditor
        editor={editor}
        className={cn(
          'mt-1.5 text-fg-primary',
          isEditing &&
            'rounded-md border border-accent bg-surface-input px-2 py-1.5 text-base sm:text-sm'
        )}
      />
      {isEditing && <div className='mt-1 text-fg-muted text-xs'>Enter to save · Esc to cancel</div>}
      {isDeleting && (
        <DeletePageCommentDialog
          commentId={commentId}
          isThreadStarter={isThreadStarter}
          closeDialog={() => setIsDeleting(false)}
        />
      )}
    </div>
  )
}
