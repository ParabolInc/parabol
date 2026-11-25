import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../../routing/useQueryRefLease'
import OrgPlansAndBilling from './OrgPlansAndBilling'
import useOrganizationOutlet from './useOrganizationOutlet'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/me/organizations/$orgId/billing'
)

const OrgBillingRoute = () => {
  const {organization} = useOrganizationOutlet()
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <OrgPlansAndBilling queryRef={queryRef} organizationRef={organization} />
}

export default OrgBillingRoute
