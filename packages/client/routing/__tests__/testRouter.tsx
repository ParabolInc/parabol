import {
  type AnyRouter,
  createBrowserHistory,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  type RouteComponent
} from '@tanstack/react-router'
import type {ReactNode} from 'react'
import {parseSearch, stringifySearch} from '../searchParams'

interface TestRouterOptions {
  // keyed by TanStack paths, like '/team/$teamId'
  routes: Record<string, ReactNode>
  // renders <Outlet /> where the matched route goes, beside anything a test needs inside the router
  rootComponent?: RouteComponent
  // without one the router follows the window's URL
  initialEntry?: string
}

const routers: AnyRouter[] = []

export const createTestRouter = ({
  routes,
  rootComponent = Outlet,
  initialEntry
}: TestRouterOptions) => {
  // router-core calls a bare scrollTo after each navigation, which only a browser defines
  if (typeof scrollTo === 'undefined') Object.assign(globalThis, {scrollTo: () => {}})
  const rootRoute = createRootRoute({component: rootComponent})
  const routeTree = rootRoute.addChildren(
    Object.entries(routes).map(([path, element]) =>
      createRoute({getParentRoute: () => rootRoute, path, component: () => element})
    )
  )
  const history = initialEntry
    ? createMemoryHistory({initialEntries: [initialEntry]})
    : createBrowserHistory()
  const router = createRouter({routeTree, history, parseSearch, stringifySearch})
  routers.push(router)
  return router
}

// A browser history patches window.history, so each one is undone before the next test makes its own
export const destroyTestRouters = () => {
  for (const router of routers.splice(0)) router.history.destroy()
}
