import {createRoute, lazyRouteComponent} from '@tanstack/react-router'
import teamArchiveQuery, {type TeamArchiveQuery} from '../../__generated__/TeamArchiveQuery.graphql'
import teamContainerQuery, {
  type TeamContainerQuery
} from '../../__generated__/TeamContainerQuery.graphql'
import teamDashMainQuery, {
  type TeamDashMainQuery
} from '../../__generated__/TeamDashMainQuery.graphql'
import teamSettingsQuery, {
  type TeamSettingsQuery
} from '../../__generated__/TeamSettingsQuery.graphql'
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
  loader: async ({context: {queryRefs}, params: {teamId}}) => ({
    queryRef: await queryRefs.load<TeamContainerQuery>(teamContainerQuery, {teamId})
  }),
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'TeamRoute' */ '../../modules/teamDashboard/components/TeamRoute')
  )
})
export const teamSettingsRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: 'settings',
  loader: async ({context: {queryRefs}, params: {teamId}}) => ({
    queryRef: await queryRefs.load<TeamSettingsQuery>(teamSettingsQuery, {teamId})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'TeamSettingsRoute' */ '../../modules/teamDashboard/components/TeamSettingsRoute'
      )
  )
})
export const teamArchiveRoute = createRoute({
  getParentRoute: () => teamRoute,
  path: 'archive',
  loader: async ({context: {queryRefs}, params: {teamId}}) => ({
    queryRef: await queryRefs.load<TeamArchiveQuery>(teamArchiveQuery, {
      teamIds: [teamId],
      first: 40
    })
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'TeamArchiveRoute' */ '../../modules/teamDashboard/components/TeamArchiveRoute'
      )
  )
})
export const teamDashMainLayoutRoute = createRoute({
  getParentRoute: () => teamRoute,
  id: 'teamDashMainLayout',
  loader: async ({context: {queryRefs}, params: {teamId}}) => ({
    queryRef: await queryRefs.load<TeamDashMainQuery>(teamDashMainQuery, {teamId})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'TeamDashMainRoute' */ '../../modules/teamDashboard/components/TeamDashMainRoute'
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
