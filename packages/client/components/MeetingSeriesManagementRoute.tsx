import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../routing/useQueryRefLease'
import MeetingSeriesManagementPage from './MeetingSeriesManagementPage'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/meeting-series/manage/$meetingSeriesId')

const MeetingSeriesManagementRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <MeetingSeriesManagementPage queryRef={queryRef} />
}

export default MeetingSeriesManagementRoute
