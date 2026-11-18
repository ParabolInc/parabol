import {Suspense} from 'react'
import ReviewRequestToJoinOrgModal from '~/components/ReviewRequestToJoinOrgModal'
import reviewRequestToJoinOrgModalQuery, {
  type ReviewRequestToJoinOrgModalQuery
} from '../__generated__/ReviewRequestToJoinOrgModalQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'

interface Props {
  requestId: string
  onClose: () => void
}

const ReviewRequestToJoinOrgRoot = ({requestId, onClose}: Props) => {
  const queryRef = useQueryLoaderNow<ReviewRequestToJoinOrgModalQuery>(
    reviewRequestToJoinOrgModalQuery,
    {requestId},
    'network-only'
  )
  return (
    <Suspense fallback=''>
      {queryRef && <ReviewRequestToJoinOrgModal onClose={onClose} queryRef={queryRef} />}
    </Suspense>
  )
}

export default ReviewRequestToJoinOrgRoot
