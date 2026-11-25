import {createBrowserHistory, createRouter, lazyRouteComponent} from '@tanstack/react-router'
import type {TeamInviteeResult} from '../hooks/useTeamInviteeDrafts'
import type {NavigateFn} from '../types/relayMutations'
import matchReportedRoute from '../utils/matchReportedRoute'
import {startNavigation} from '../utils/navigationTimings'
import appAtmosphere from './appAtmosphere'
import {createQueryRefs} from './queryRefs'
import RethrowRouteError from './RethrowRouteError'
import {routeTree} from './routeTree'
import {parseSearch, stringifySearch} from './searchParams'

const queryRefs = createQueryRefs(appAtmosphere, appAtmosphere.retries)
const navigate: NavigateFn = (options) => appRouter.navigate(options)

const appRouter = createRouter({
  routeTree,
  history: createBrowserHistory(),
  context: {atmosphere: appAtmosphere, navigate, queryRefs},
  parseSearch,
  stringifySearch,
  // The registry caches route queries, so the router keeps no loader data of its own
  defaultGcTime: 0,
  defaultPreloadStaleTime: 0,
  defaultPreloadGcTime: 30_000,
  // The old page stays up this long while the new one loads, then the new one shows its pending state
  defaultPendingMs: 300,
  defaultPendingMinMs: 300,
  defaultPendingComponent: () => null,
  defaultErrorComponent: RethrowRouteError,
  defaultNotFoundComponent: lazyRouteComponent(
    () => import(/* webpackChunkName: 'NotFound' */ '../components/NotFound/NotFound')
  )
})

appRouter.subscribe('onResolved', queryRefs.sweep)

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
    isSignInRequired?: boolean
    orgJoinRequestId?: string
    prevCategory?: string
  }
}

export default appRouter
