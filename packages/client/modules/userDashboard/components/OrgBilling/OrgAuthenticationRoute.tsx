import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../../routing/useQueryRefLease'
import OrgAuthentication from '../OrgAuthentication/OrgAuthentication'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/me/organizations/$orgId/authentication'
)

const OrgAuthenticationRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <OrgAuthentication queryRef={queryRef} />
}

export default OrgAuthenticationRoute
