import {createRoute, lazyRouteComponent} from '@tanstack/react-router'
import teamContainerQuery, {
  type TeamContainerQuery
} from '../../__generated__/TeamContainerQuery.graphql'
import teamDashMainQuery, {
  type TeamDashMainQuery
} from '../../__generated__/TeamDashMainQuery.graphql'
import {holdForData, loadRouteQuery} from '../routeQueries'
import {dashboardLayoutRoute} from './dashboardRoutes'

const TeamDashActivityRoute = lazyRouteComponent(
  () =>
    import(
      /* webpackChunkName: 'TeamDashActivityRoute' */ '../../modules/teamDashboard/components/TeamDashMain/TeamDashActivityRoute'
    )
)

export const teamRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'team/$teamId',
  loader: ({context: {atmosphere}, params: {teamId}}) => {
    if (!atmosphere.authObj) return
    return holdForData([
      loadRouteQuery<TeamContainerQuery>(atmosphere, teamContainerQuery, {teamId})
    ])
  },
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'TeamRoot' */ '../../modules/teamDashboard/components/TeamRoot')
  )
})
export const teamSettingsRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: 'settings',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'TeamIntegrationsRoot' */ '../../modules/teamDashboard/components/TeamSettingsRoute'
      )
  )
})
export const teamArchiveRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: 'archive',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'ArchiveTaskRoot' */ '../../modules/teamDashboard/components/TeamArchiveRoute'
      )
  )
})
export const teamDashMainLayoutRoute = createRoute({
  getParentRoute: () => teamRoute,
  id: 'teamDashMainLayout',
  loader: ({context: {atmosphere}, params: {teamId}}) => {
    if (!atmosphere.authObj) return
    return holdForData([loadRouteQuery<TeamDashMainQuery>(atmosphere, teamDashMainQuery, {teamId})])
  },
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'TeamDashMainRoot' */ '../../modules/teamDashboard/components/TeamDashMainRoot'
      )
  )
})
export const teamTasksRoute = createRoute({
  getParentRoute: () => teamDashMainLayoutRoute,
  path: 'tasks',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'TeamDashTasksRoute' */ '../../modules/teamDashboard/components/TeamDashMain/TeamDashTasksRoute'
      )
  )
})
export const teamIntegrationsRoute = createRoute({
  getParentRoute: () => teamDashMainLayoutRoute,
  path: 'integrations',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'TeamDashIntegrationsRoute' */ '../../modules/teamDashboard/components/TeamDashMain/TeamDashIntegrationsRoute'
      )
  )
})
export const teamActivityRoute = createRoute({
  getParentRoute: () => teamDashMainLayoutRoute,
  path: '/',
  component: TeamDashActivityRoute
})
// Any other team URL falls back to the activity tab
export const teamActivityFallbackRoute = createRoute({
  getParentRoute: () => teamDashMainLayoutRoute,
  path: '$',
  component: TeamDashActivityRoute
})
