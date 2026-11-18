import {getRouteApi, useNavigate} from '@tanstack/react-router'
import {useCallback} from 'react'
import ShareTopicModal from '~/components/ShareTopicModal'
import useQueryRefLease from '../routing/useQueryRefLease'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/new-summary/$meetingId/share/$stageId'
)

const ShareTopicRoute = () => {
  const {meetingId, stageId} = routeApi.useParams()
  const {queryRef} = routeApi.useLoaderData()
  const navigate = useNavigate()
  useQueryRefLease(queryRef)
  const onClose = useCallback(() => {
    navigate({to: '/new-summary/$meetingId', params: {meetingId}, replace: true})
  }, [meetingId])
  return (
    <ShareTopicModal
      stageId={stageId}
      meetingId={meetingId}
      isOpen={true}
      onClose={onClose}
      queryRef={queryRef}
    />
  )
}

export default ShareTopicRoute
