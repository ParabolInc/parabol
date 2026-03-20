import {Suspense, useCallback, useEffect} from 'react'
import {useLocation, useNavigate, useParams} from 'react-router'
import ReviewRequestToJoinOrgModal from '~/components/ReviewRequestToJoinOrgModal'
import reviewRequestToJoinOrgModalQuery, {
  type ReviewRequestToJoinOrgModalQuery
} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'
import useModal from '../hooks/useModal'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'

const ReviewRequestToJoinOrgRoot = () => {
  const {requestId} = useParams()
  const queryRef = useQueryLoaderNow<ReviewRequestToJoinOrgModalQuery>(
    reviewRequestToJoinOrgModalQuery,
    {requestId: requestId!},
    'network-only'
  )

  const location = useLocation()
  const navigate = useNavigate()

  const onClose = useCallback(() => {
    const state = location.state as {backgroundLocation?: Location} | null
    navigate(state?.backgroundLocation ?? '/meetings', {replace: true})
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
