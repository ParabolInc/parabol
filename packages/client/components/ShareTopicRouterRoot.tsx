import {Suspense, useCallback} from 'react'
import {useHistory, useLocation, useParams} from 'react-router'
import ShareTopicModal from '~/components/ShareTopicModal'
import shareTopicModalQuery, {
  type ShareTopicModalQuery
} from '../__generated__/ShareTopicModalQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {Loader} from '../utils/relay/renderLoader'

const ShareTopicRouterRoot = () => {
  const {meetingId, stageId} = useParams<{stageId: string; meetingId: string}>()

  const queryRef = useQueryLoaderNow<ShareTopicModalQuery>(
    shareTopicModalQuery,
    {meetingId},
    'network-only'
  )

  const location = useLocation<{backgroundLocation?: Location}>()
  const history = useHistory()

  const onClose = useCallback(() => {
    const state = location.state
    history.replace(state?.backgroundLocation ?? `/new-summary/${meetingId}`)
  }, [location])

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

export default ShareTopicRouterRoot
