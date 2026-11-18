import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../routing/useQueryRefLease'
import ActivityDetails from './ActivityDetails'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/activity-library/details/$activityId')

const ActivityDetailsRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <ActivityDetails queryRef={queryRef} />
}

export default ActivityDetailsRoute
