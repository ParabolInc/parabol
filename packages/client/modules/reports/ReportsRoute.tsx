import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../routing/useQueryRefLease'
import ReportsRedirect from './ReportsRedirect'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/reports')

const ReportsRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <ReportsRedirect queryRef={queryRef} />
}

export default ReportsRoute
