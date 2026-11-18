import {useNavigate, useParams} from '@tanstack/react-router'
import {Suspense, useCallback} from 'react'
import ShareTopicModal from '~/components/ShareTopicModal'
import shareTopicModalQuery, {
  type ShareTopicModalQuery
} from '../__generated__/ShareTopicModalQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {Loader} from '../utils/relay/renderLoader'

const ShareTopicRouterRoot = () => {
  const {meetingId, stageId} = useParams({strict: false})

  const queryRef = useQueryLoaderNow<ShareTopicModalQuery>(
    shareTopicModalQuery,
    {meetingId: meetingId!},
    'network-only'
  )

  const navigate = useNavigate()

  const onClose = useCallback(() => {
    navigate({to: '/new-summary/$meetingId', params: {meetingId: meetingId!}, replace: true})
  }, [meetingId])

  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <ShareTopicModal
          stageId={stageId!}
          meetingId={meetingId!}
          isOpen={true}
          onClose={onClose}
          queryRef={queryRef}
        />
      )}
    </Suspense>
  )
}

export default ShareTopicRouterRoot
