import React, {ReactNode, RefObject, Suspense} from 'react'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import discussionThreadQuery, {
  DiscussionThreadQuery
} from '../__generated__/DiscussionThreadQuery.graphql'
import DiscussionThread from './DiscussionThread'
import {DiscussionThreadables} from './DiscussionThreadList'

interface Props {
  meetingContentRef?: RefObject<HTMLDivElement>
  discussionId: string
  allowedThreadables: DiscussionThreadables[]
  width?: string
  header?: ReactNode
  emptyState?: ReactNode
}

const DiscussionThreadRoot = (props: Props) => {
  const {allowedThreadables, meetingContentRef, discussionId, width, header, emptyState} = props
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
        />
      )}
    </Suspense>
  )
}

export default DiscussionThreadRoot
