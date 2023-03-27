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
  showTranscription?: boolean
  transcription?: string | null
}

const DiscussionThreadRoot = (props: Props) => {
  const {
    allowedThreadables,
    meetingContentRef,
    discussionId,
    width,
    header,
    emptyState,
    transcription,
    showTranscription
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
          transcription={transcription}
          showTranscription={showTranscription}
        />
      )}
    </Suspense>
  )
}

export default DiscussionThreadRoot
