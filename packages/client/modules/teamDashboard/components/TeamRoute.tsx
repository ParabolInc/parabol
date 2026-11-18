import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../routing/useQueryRefLease'
import TeamContainer from '../containers/Team/TeamContainer'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/team/$teamId')

const TeamRoute = () => {
  const {teamId} = routeApi.useParams()
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <TeamContainer queryRef={queryRef} teamId={teamId} />
}

export default TeamRoute
