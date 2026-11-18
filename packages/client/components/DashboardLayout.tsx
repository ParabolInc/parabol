import {getRouteApi, Outlet} from '@tanstack/react-router'
import useQueryRefLease from '../routing/useQueryRefLease'
import Dashboard from './Dashboard'
import {useIsAuthenticated} from './IsAuthenticatedProvider'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout')

const DashboardLayout = () => {
  const isAuthenticated = useIsAuthenticated()
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  // Only a public page reaches the dashboard signed out, and it renders without it
  if (!isAuthenticated || !queryRef) return <Outlet />
  return <Dashboard queryRef={queryRef} />
}

export default DashboardLayout
