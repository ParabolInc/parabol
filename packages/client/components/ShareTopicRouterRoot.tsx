import {Suspense, useCallback} from 'react'
import {useHistory, useLocation} from 'react-router'
import ShareTopicModal from '~/components/ShareTopicModal'
import shareTopicModalQuery, {
  ShareTopicModalQuery
} from '../__generated__/ShareTopicModalQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useRouter from '../hooks/useRouter'
import {Loader} from '../utils/relay/renderLoader'

const ShareTopicRouterRoot = () => {
  const {match} = useRouter<{stageId: string; meetingId: string}>()
  const {params} = match

  const {meetingId, stageId} = params

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
