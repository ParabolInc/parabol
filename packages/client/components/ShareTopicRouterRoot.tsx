import {Suspense, useCallback} from 'react'
import {useLocation, useNavigate, useParams} from 'react-router'
import ShareTopicModal from '~/components/ShareTopicModal'
import shareTopicModalQuery, {
  type ShareTopicModalQuery
} from '../__generated__/ShareTopicModalQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {Loader} from '../utils/relay/renderLoader'

const ShareTopicRouterRoot = () => {
  const {meetingId, stageId} = useParams()

  const queryRef = useQueryLoaderNow<ShareTopicModalQuery>(
    shareTopicModalQuery,
    {meetingId: meetingId!},
    'network-only'
  )

  const location = useLocation()
  const navigate = useNavigate()

  const onClose = useCallback(() => {
    const state = location.state as {backgroundLocation?: Location} | null
    navigate(state?.backgroundLocation ?? `/new-summary/${meetingId}`, {replace: true})
  }, [location])

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
