import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PageThreadCard_thread$key} from '../../../__generated__/PageThreadCard_thread.graphql'
import {useAddPageCommentMutation} from '../../../mutations/useAddPageCommentMutation'
import {cn} from '../../../ui/cn'
import {PageCommentComposer} from './PageCommentComposer'
import {PageCommentItem} from './PageCommentItem'
import {PageThreadResolveButton} from './PageThreadResolveButton'

interface Props {
  threadRef: PageThreadCard_thread$key
  pageId: string
  viewerId: string
  isPageOwner: boolean
  isActive: boolean
  note?: string
  showQuote?: boolean
  onActivate: () => void
}

export const PageThreadCard = (props: Props) => {
  const {threadRef, pageId, viewerId, isPageOwner, isActive, note, showQuote, onActivate} = props
  const thread = useFragment(
    graphql`
      fragment PageThreadCard_thread on PageThread {
        id
        quote
        resolvedAt
        resolvedByUser {
          preferredName
        }
        comments {
          id
          ...PageCommentItem_comment
        }
      }
    `,
    threadRef
  )
  const {id: threadId, quote, resolvedAt, resolvedByUser, comments} = thread
  const isResolved = !!resolvedAt
  const resolvedNote = resolvedByUser ? `Resolved by ${resolvedByUser.preferredName}` : 'Resolved'
  const [isReplying, setIsReplying] = useState(false)
  const [addComment, submitting] = useAddPageCommentMutation()
  const submitReply = (content: string, onSubmitted: () => void) => {
    addComment({
      variables: {pageId, threadId, content},
      onCompleted: () => {
        onSubmitted()
        setIsReplying(false)
      }
    })
  }
  return (
    <div
      onClick={onActivate}
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-surface-card p-3 transition-shadow',
        isActive ? 'border-hairline-strong shadow-card-1' : 'border-hairline'
      )}
    >
      {showQuote && (
        <div className='line-clamp-2 border-gold-500 border-l-2 pl-2 text-fg-secondary text-xs leading-4'>
          {quote}
        </div>
      )}
      {note && <div className='text-fg-muted text-xs'>{note}</div>}
      {isResolved && <div className='text-fg-muted text-xs'>{resolvedNote}</div>}
      {comments.map((comment, idx) => (
        <PageCommentItem
          key={comment.id}
          commentRef={comment}
          viewerId={viewerId}
          isPageOwner={isPageOwner}
          isThreadStarter={idx === 0}
          threadActions={
            idx === 0 && <PageThreadResolveButton threadId={threadId} isResolved={isResolved} />
          }
        />
      ))}
      {isReplying && (
        <PageCommentComposer
          placeholder='Reply'
          submitLabel='Reply'
          submitting={submitting}
          autoFocus
          onSubmit={submitReply}
          onCancel={() => setIsReplying(false)}
        />
      )}
      {!isReplying && !isResolved && (
        <button
          onClick={() => setIsReplying(true)}
          className='cursor-text rounded-md border border-hairline-field bg-surface-input px-2 py-1.5 text-left text-fg-muted text-sm'
        >
          Reply
        </button>
      )}
    </div>
  )
}
