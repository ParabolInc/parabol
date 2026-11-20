import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../routing/useQueryRefLease'
import MeetingSelector from './MeetingSelector'

const meetingRouteApi = getRouteApi('/tipTapLayout/privateLayout/meet/$meetingId')

const MeetingRoute = () => {
  const {queryRef} = meetingRouteApi.useLoaderData()
  const {meetingId} = queryRef.variables
  useQueryRefLease(queryRef)
  // a different meeting mounts fresh, so it opens on its own phase
  return <MeetingSelector key={meetingId} meetingId={meetingId} queryRef={queryRef} />
}

export default MeetingRoute
