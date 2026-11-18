import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../../routing/useQueryRefLease'
import Organization from '../../components/OrgBilling/Organization'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/me/organizations/$orgId')

const OrganizationRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <Organization queryRef={queryRef} />
}

export default OrganizationRoute
