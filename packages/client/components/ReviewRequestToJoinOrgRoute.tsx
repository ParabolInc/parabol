import {useNavigate, useParams} from '@tanstack/react-router'
import ReviewRequestToJoinOrgRoot from './ReviewRequestToJoinOrgRoot'

const ReviewRequestToJoinOrgRoute = () => {
  const {requestId} = useParams({strict: false})
  const navigate = useNavigate()
  const onClose = () => {
    navigate({to: '/meetings', replace: true})
  }
  return <ReviewRequestToJoinOrgRoot requestId={requestId!} onClose={onClose} />
}

export default ReviewRequestToJoinOrgRoute
