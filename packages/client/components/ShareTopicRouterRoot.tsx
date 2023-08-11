import React, {Suspense, useCallback} from 'react'
import {useHistory, useLocation} from 'react-router'
import useRouter from '../hooks/useRouter'
import ShareTopicModal from '~/components/ShareTopicModal'
import {renderLoader} from '../utils/relay/renderLoader'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import shareTopicModalQuery, {
  ShareTopicModalQuery
} from '../__generated__/ShareTopicModalQuery.graphql'

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

export default ShareTopicRouterRoot
