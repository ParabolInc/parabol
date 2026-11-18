import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../../routing/useQueryRefLease'
import Organizations from '../../components/Organizations/Organizations'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/me/organizations')

const OrganizationsRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <Organizations queryRef={queryRef} />
}

export default OrganizationsRoute
