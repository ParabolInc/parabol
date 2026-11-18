import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../routing/useQueryRefLease'
import ViewerNotOnTeam from './ViewerNotOnTeam'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/invitation-required')

const ViewerNotOnTeamRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <ViewerNotOnTeam queryRef={queryRef} />
}

export default ViewerNotOnTeamRoute
