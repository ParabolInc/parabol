import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../../routing/useQueryRefLease'
import OrgMembers from '../OrgMembers/OrgMembers'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/me/organizations/$orgId/members'
)

const OrgMembersRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <OrgMembers queryRef={queryRef} />
}

export default OrgMembersRoute
