import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../../routing/useQueryRefLease'
import {OrgTeamMembers} from './OrgTeamMembers'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/me/organizations/$orgId/teams/$teamId'
)

const OrgTeamMembersRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <OrgTeamMembers queryRef={queryRef} />
}

export default OrgTeamMembersRoute
