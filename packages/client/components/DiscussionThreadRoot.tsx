import {type ReactNode, type RefObject, Suspense} from 'react'
import discussionThreadQuery, {
  type DiscussionThreadQuery
} from '../__generated__/DiscussionThreadQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import DiscussionThread from './DiscussionThread'
import type {DiscussionThreadables} from './DiscussionThreadList'

interface Props {
  meetingContentRef?: RefObject<HTMLDivElement>
  discussionId: string
  allowedThreadables: DiscussionThreadables[]
  width?: string
  header?: ReactNode
  emptyState?: ReactNode
  autoFocus?: boolean
}

const DiscussionThreadRoot = (props: Props) => {
  const {
    allowedThreadables,
    meetingContentRef,
    discussionId,
    width,
    header,
    emptyState,
    autoFocus
  } = props
  const queryRef = useQueryLoaderNow<DiscussionThreadQuery>(discussionThreadQuery, {discussionId})
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <DiscussionThread
          allowedThreadables={allowedThreadables}
          meetingContentRef={meetingContentRef}
          queryRef={queryRef}
          width={width}
          header={header}
          emptyState={emptyState}
          autoFocus={autoFocus}
        />
      )}
    </Suspense>
  )
}

export default DiscussionThreadRoot
