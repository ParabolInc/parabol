import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../routing/useQueryRefLease'
import MyDashboardTimeline from './MyDashboardTimeline'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/me/userDashMainLayout/timelineLayout'
)

const MyDashboardTimelineRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <MyDashboardTimeline queryRef={queryRef} />
}

export default MyDashboardTimelineRoute
