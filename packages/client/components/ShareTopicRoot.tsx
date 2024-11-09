import {Suspense} from 'react'
import ShareTopicModal from '~/components/ShareTopicModal'
import shareTopicModalQuery, {
  ShareTopicModalQuery
} from '../__generated__/ShareTopicModalQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {Loader} from '../utils/relay/renderLoader'

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
    <Suspense fallback={<Loader />}>
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
