import {Outlet} from '@tanstack/react-router'
import DashboardRoot from './DashboardRoot'
import {useIsAuthenticated} from './IsAuthenticatedProvider'

const DashboardLayout = () => {
  const isAuthenticated = useIsAuthenticated()
  // Only a public page reaches the dashboard signed out, and it renders without it
  if (!isAuthenticated) return <Outlet />
  return <DashboardRoot />
}

export default DashboardLayout
