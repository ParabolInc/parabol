import React, {Suspense} from 'react'
import ShareTopicModal from '~/components/ShareTopicModal'
import {renderLoader} from '../utils/relay/renderLoader'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import shareTopicModalQuery, {
  ShareTopicModalQuery
} from '../__generated__/ShareTopicModalQuery.graphql'

interface Props {
  onClose: () => void
  stageId: string
  meetingId: string
}

const ShareTopicRoot = (props: Props) => {
  const {stageId, meetingId, onClose} = props

  const queryRef = useQueryLoaderNow<ShareTopicModalQuery>(
    shareTopicModalQuery,
    {meetingId},
    'network-only'
  )

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && (
        <ShareTopicModal
          stageId={stageId}
          meetingId={meetingId}
          isOpen={true}
          onClose={onClose}
          queryRef={queryRef}
        />
      )}
    </Suspense>
  )
}

export default ShareTopicRoot
