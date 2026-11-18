import {useLocation, useNavigate} from '@tanstack/react-router'
import ReviewRequestToJoinOrgRoot from './ReviewRequestToJoinOrgRoot'

// A review opened from a notification shows its own URL while the page behind it stays mounted
const MaskedReviewRequestToJoinOrg = () => {
  const requestId = useLocation({
    select: (location) => (location.maskedLocation ? location.state.orgJoinRequestId : undefined)
  })
  const navigate = useNavigate()
  if (!requestId) return null
  const onClose = () => {
    navigate({to: '.', params: true, search: true, hash: true, replace: true})
  }
  return <ReviewRequestToJoinOrgRoot requestId={requestId} onClose={onClose} />
}

export default MaskedReviewRequestToJoinOrg
