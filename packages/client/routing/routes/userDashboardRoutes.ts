import {createRoute, lazyRouteComponent, redirect} from '@tanstack/react-router'
import myDashboardTimelineQuery, {
  type MyDashboardTimelineQuery
} from '../../__generated__/MyDashboardTimelineQuery.graphql'
import orgAuthenticationQuery, {
  type OrgAuthenticationQuery
} from '../../__generated__/OrgAuthenticationQuery.graphql'
import organizationQuery, {
  type OrganizationQuery
} from '../../__generated__/OrganizationQuery.graphql'
import organizationsQuery, {
  type OrganizationsQuery
} from '../../__generated__/OrganizationsQuery.graphql'
import orgMembersQuery, {type OrgMembersQuery} from '../../__generated__/OrgMembersQuery.graphql'
import orgTeamMembersQuery, {
  type OrgTeamMembersQuery
} from '../../__generated__/OrgTeamMembersQuery.graphql'
import userProfileQuery, {type UserProfileQuery} from '../../__generated__/UserProfileQuery.graphql'
import {
  AUTHENTICATION_PAGE,
  BILLING_PAGE,
  MEMBERS_PAGE,
  ORG_INTEGRATIONS_PAGE,
  ORG_SETTINGS_PAGE,
  TEAMS_PAGE
} from '../../utils/constants'
import {parseQueryParams} from '../../utils/useQueryParameterParser'
import {dashboardLayoutRoute} from './dashboardRoutes'

export const meRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'me'
})
export const profileRoute = createRoute({
  getParentRoute: () => meRoute,
  path: 'profile',
  loader: async ({context: {queryRefs}}) => ({
    queryRef: await queryRefs.load<UserProfileQuery>(userProfileQuery, {})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'UserProfileRoute' */ '../../modules/userDashboard/components/UserProfileRoute'
      )
  )
})
export const organizationsRoute = createRoute({
  getParentRoute: () => meRoute,
  path: 'organizations',
  loader: async ({context: {queryRefs}}) => ({
    queryRef: await queryRefs.load<OrganizationsQuery>(organizationsQuery, {})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrganizationsRoute' */ '../../modules/userDashboard/containers/Organizations/OrganizationsRoute'
      )
  )
})
export const organizationRoute = createRoute({
  getParentRoute: () => meRoute,
  path: 'organizations/$orgId',
  loader: async ({context: {queryRefs}, params: {orgId}}) => ({
    queryRef: await queryRefs.load<OrganizationQuery>(organizationQuery, {orgId})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrganizationRoute' */ '../../modules/userDashboard/containers/Organization/OrganizationRoute'
      )
  )
})
export const organizationIndexRoute = createRoute({
  getParentRoute: () => organizationRoute,
  path: '/',
  beforeLoad: ({params}) => {
    throw redirect({
      to: '/me/organizations/$orgId/billing',
      params: {orgId: params.orgId},
      replace: true
    })
  }
})
export const orgBillingRoute = createRoute({
  getParentRoute: () => organizationRoute,
  path: BILLING_PAGE,
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrgPlansAndBillingRoot' */ '../../modules/userDashboard/components/OrgBilling/OrgBillingRoute'
      )
  )
})
export const orgMembersRoute = createRoute({
  getParentRoute: () => organizationRoute,
  path: MEMBERS_PAGE,
  loader: async ({context: {queryRefs}, params: {orgId}}) => ({
    queryRef: await queryRefs.load<OrgMembersQuery>(orgMembersQuery, {orgId, first: 10000})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrgMembersRoute' */ '../../modules/userDashboard/components/OrgBilling/OrgMembersRoute'
      )
  )
})
export const orgSettingsRoute = createRoute({
  getParentRoute: () => organizationRoute,
  path: ORG_SETTINGS_PAGE,
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrgDetails' */ '../../modules/userDashboard/components/OrgBilling/OrgSettingsRoute'
      )
  )
})
export const orgIntegrationsRoute = createRoute({
  getParentRoute: () => organizationRoute,
  path: ORG_INTEGRATIONS_PAGE,
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrgIntegrations' */ '../../modules/userDashboard/components/OrgBilling/OrgIntegrationsRoute'
      )
  )
})
export const orgAuthenticationRoute = createRoute({
  getParentRoute: () => organizationRoute,
  path: AUTHENTICATION_PAGE,
  loader: async ({context: {queryRefs}, params: {orgId}}) => ({
    queryRef: await queryRefs.load<OrgAuthenticationQuery>(orgAuthenticationQuery, {orgId})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'Authentication' */ '../../modules/userDashboard/components/OrgBilling/OrgAuthenticationRoute'
      )
  )
})
export const orgTeamsRoute = createRoute({
  getParentRoute: () => organizationRoute,
  path: TEAMS_PAGE,
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrgTeams' */ '../../modules/userDashboard/components/OrgBilling/OrgTeamsRoute'
      )
  )
})
export const orgTeamMembersRoute = createRoute({
  getParentRoute: () => organizationRoute,
  path: `${TEAMS_PAGE}/$teamId`,
  loader: async ({context: {queryRefs}, params: {teamId}}) => ({
    queryRef: await queryRefs.load<OrgTeamMembersQuery>(orgTeamMembersQuery, {teamId})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrgTeamMembers' */ '../../modules/userDashboard/components/OrgTeamMembers/OrgTeamMembersRoute'
      )
  )
})
export const userDashMainLayoutRoute = createRoute({
  getParentRoute: () => meRoute,
  id: 'userDashMainLayout',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'UserDashMain' */ '../../modules/userDashboard/components/UserDashMain'
      )
  )
})
export const myTasksRoute = createRoute({
  getParentRoute: () => userDashMainLayoutRoute,
  path: 'tasks',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'MyDashboardTasksRoot' */ '../../components/UserTaskViewRoot')
  )
})
// The timeline and every other /me URL share one query, filtered by the URL's search
export const timelineLayoutRoute = createRoute({
  getParentRoute: () => userDashMainLayoutRoute,
  id: 'timelineLayout',
  loaderDeps: ({search}) => ({search}),
  loader: async ({context: {atmosphere, queryRefs}, location}) => {
    const {viewerId} = atmosphere
    const {teamIds, eventTypes, showArchived} = parseQueryParams(viewerId, location.searchStr)
    return {
      queryRef: await queryRefs.load<MyDashboardTimelineQuery>(myDashboardTimelineQuery, {
        first: 10,
        userIds: [viewerId],
        teamIds,
        eventTypes,
        archived: showArchived
      })
    }
  },
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'MyDashboardTimelineRoute' */ '../../components/MyDashboardTimelineRoute'
      )
  )
})
export const timelineRoute = createRoute({
  getParentRoute: () => timelineLayoutRoute,
  path: '/'
})
// Any other /me URL falls back to the timeline
export const timelineFallbackRoute = createRoute({
  getParentRoute: () => timelineLayoutRoute,
  path: '$'
})
