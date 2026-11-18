import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../routing/useQueryRefLease'
import {ActivityLibrary} from './ActivityLibrary'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/activity-library/activityLibraryHome')

const ActivityLibraryRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <ActivityLibrary queryRef={queryRef} />
}

export default ActivityLibraryRoute
