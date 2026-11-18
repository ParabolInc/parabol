import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../routing/useQueryRefLease'
import UserProfile from './UserProfile'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/me/profile')

const UserProfileRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <UserProfile queryRef={queryRef} />
}

export default UserProfileRoute
