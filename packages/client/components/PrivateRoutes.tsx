import {Outlet, useMatchRoute} from '@tanstack/react-router'
import {useIsAuthenticated} from './IsAuthenticatedProvider'
import SignedInRoutes from './SignedInRoutes'

const PrivateRoutes = () => {
  const isAuthenticated = useIsAuthenticated()
  const matchRoute = useMatchRoute()
  // A signed-out reader of a public page gets the page on its own
  if (!isAuthenticated && matchRoute({to: '/pages/$pageSlug'})) return <Outlet />
  return <SignedInRoutes />
}

export default PrivateRoutes
