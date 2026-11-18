import {
  createBrowserHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet
} from '@tanstack/react-router'
import dashboardQuery, {type DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import teamContainerQuery, {
  type TeamContainerQuery
} from '../__generated__/TeamContainerQuery.graphql'
import teamDashMainQuery, {type TeamDashMainQuery} from '../__generated__/TeamDashMainQuery.graphql'
import type Atmosphere from '../Atmosphere'
import matchReportedRoute from '../utils/matchReportedRoute'
import {startNavigation} from '../utils/navigationTimings'
import appAtmosphere from './appAtmosphere'
import createReactRouterHistory from './createReactRouterHistory'
import LegacyApp from './LegacyApp'
import {
  DashboardRoot,
  MeetingsDash,
  TeamDashMainRoot,
  TeamRoot,
  TipTapLayout
} from './legacyRouteComponents'
import {holdForPage, loadRouteQuery} from './routeQueries'

const rootRoute = createRootRouteWithContext<{atmosphere: Atmosphere}>()({component: Outlet})

// Every URL TanStack Router does not own yet stays mounted in one legacy layout, so moving between them never remounts the app
const legacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'legacy',
  component: LegacyApp
})
const legacyIndexRoute = createRoute({getParentRoute: () => legacyRoute, path: '/'})
const legacySplatRoute = createRoute({getParentRoute: () => legacyRoute, path: '$'})

// These routes render nothing. As soon as the URL changes they start the queries the legacy roots will ask for,
// and the chunks those roots render, all at once
const dashboardDataRoute = createRoute({
  getParentRoute: () => legacyRoute,
  id: 'dashboardData',
  loader: ({context: {atmosphere}}) => {
    if (!atmosphere.authObj) return
    return holdForPage(
      [loadRouteQuery<DashboardQuery>(atmosphere, dashboardQuery, {first: 5, nullId: null})],
      [TipTapLayout, DashboardRoot]
    )
  }
})
const meetingsDataRoute = createRoute({
  getParentRoute: () => dashboardDataRoute,
  path: 'meetings',
  loader: ({context: {atmosphere}}) => {
    if (!atmosphere.authObj) return
    return holdForPage([], [MeetingsDash])
  }
})
const teamDataRoute = createRoute({
  getParentRoute: () => dashboardDataRoute,
  path: 'team/$teamId',
  loader: ({context: {atmosphere}, params: {teamId}}) => {
    if (!atmosphere.authObj) return
    return holdForPage(
      [loadRouteQuery<TeamContainerQuery>(atmosphere, teamContainerQuery, {teamId})],
      [TeamRoot]
    )
  }
})
const teamSettingsDataRoute = createRoute({getParentRoute: () => teamDataRoute, path: 'settings'})
const teamArchiveDataRoute = createRoute({getParentRoute: () => teamDataRoute, path: 'archive'})
const teamDashDataRoute = createRoute({
  getParentRoute: () => teamDataRoute,
  path: '$',
  loader: ({context: {atmosphere}, params: {teamId}}) => {
    if (!atmosphere.authObj) return
    return holdForPage(
      [loadRouteQuery<TeamDashMainQuery>(atmosphere, teamDashMainQuery, {teamId})],
      [TeamDashMainRoot]
    )
  }
})

const routeTree = rootRoute.addChildren([
  legacyRoute.addChildren([
    legacyIndexRoute,
    legacySplatRoute,
    dashboardDataRoute.addChildren([
      meetingsDataRoute,
      teamDataRoute.addChildren([teamSettingsDataRoute, teamArchiveDataRoute, teamDashDataRoute])
    ])
  ])
])

const routerHistory = createBrowserHistory()
export const reactRouterHistory = createReactRouterHistory(routerHistory)

const appRouter = createRouter({
  routeTree,
  history: routerHistory,
  context: {atmosphere: appAtmosphere}
})

// A navigation is timed from the moment the router starts loading it, so the queries its loaders start count toward it
let reportedRouteKey: string | undefined
appRouter.subscribe('onBeforeNavigate', ({toLocation}) => {
  const {route, key} = matchReportedRoute(toLocation.pathname)
  if (key === reportedRouteKey) return
  reportedRouteKey = key
  startNavigation(route)
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof appRouter
  }
}

export default appRouter
