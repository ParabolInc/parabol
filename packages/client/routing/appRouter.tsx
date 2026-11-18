import {createBrowserHistory, createRouter, lazyRouteComponent} from '@tanstack/react-router'
import type {TeamInviteeResult} from '../hooks/useTeamInviteeDrafts'
import matchReportedRoute from '../utils/matchReportedRoute'
import {startNavigation} from '../utils/navigationTimings'
import appAtmosphere from './appAtmosphere'
import RethrowRouteError from './RethrowRouteError'
import {routeTree} from './routeTree'
import {parseSearch, stringifySearch} from './searchParams'

const appRouter = createRouter({
  routeTree,
  history: createBrowserHistory(),
  context: {atmosphere: appAtmosphere},
  parseSearch,
  stringifySearch,
  defaultErrorComponent: RethrowRouteError,
  defaultNotFoundComponent: lazyRouteComponent(
    () => import(/* webpackChunkName: 'NotFound' */ '../components/NotFound/NotFound')
  )
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
  interface HistoryState {
    edit?: boolean
    inviteResults?: readonly TeamInviteeResult[]
    orgJoinRequestId?: string
    prevCategory?: string
  }
}

export default appRouter
