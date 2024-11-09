import {Suspense, useCallback, useEffect} from 'react'
import {useHistory, useLocation} from 'react-router'
import ReviewRequestToJoinOrgModal from '~/components/ReviewRequestToJoinOrgModal'
import reviewRequestToJoinOrgModalQuery, {
  ReviewRequestToJoinOrgModalQuery
} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'
import useModal from '../hooks/useModal'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import useRouter from '../hooks/useRouter'

const ReviewRequestToJoinOrgRoot = () => {
  const {match} = useRouter<{requestId: string}>()
  const {params} = match
  const {requestId} = params
  const queryRef = useQueryLoaderNow<ReviewRequestToJoinOrgModalQuery>(
    reviewRequestToJoinOrgModalQuery,
    {requestId},
    'network-only'
  )

  const location = useLocation<{backgroundLocation?: Location}>()
  const history = useHistory()

  const onClose = useCallback(() => {
    const state = location.state
    history.replace(state?.backgroundLocation ?? '/meetings')
  }, [location])

  const {openPortal, closePortal, modalPortal} = useModal({
    id: 'reviewRequestToJoinOrgModal',
    onClose
  })

  useEffect(() => {
    openPortal()
    return () => {
      closePortal()
    }
  }, [])

  return (
    <Suspense fallback={''}>
      {queryRef &&
        modalPortal(<ReviewRequestToJoinOrgModal closePortal={closePortal} queryRef={queryRef} />)}
    </Suspense>
  )
}

export default ReviewRequestToJoinOrgRoot
