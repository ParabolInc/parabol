import {createRoute, lazyRouteComponent, redirect} from '@tanstack/react-router'
import {
  AUTHENTICATION_PAGE,
  BILLING_PAGE,
  MEMBERS_PAGE,
  ORG_INTEGRATIONS_PAGE,
  ORG_SETTINGS_PAGE,
  TEAMS_PAGE
} from '../../utils/constants'
import {dashboardLayoutRoute} from './dashboardRoutes'

const MyDashboardTimelineRoot = lazyRouteComponent(
  () =>
    import(
      /* webpackChunkName: 'MyDashboardTimelineRoot' */ '../../components/MyDashboardTimelineRoot'
    )
)

export const meRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'me'
})
export const profileRoute = createRoute({
  getParentRoute: () => meRoute,
  path: 'profile',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'UserProfileRoot' */ '../../modules/userDashboard/components/UserProfileRoot'
      )
  )
})
export const organizationsRoute = createRoute({
  getParentRoute: () => meRoute,
  path: 'organizations',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrganizationsRoot' */ '../../modules/userDashboard/containers/Organizations/OrganizationsRoot'
      )
  )
})
export const organizationRoute = createRoute({
  getParentRoute: () => meRoute,
  path: 'organizations/$orgId',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrganizationRoot' */ '../../modules/userDashboard/containers/Organization/OrganizationRoot'
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
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrgMembersRoot' */ '../../modules/userDashboard/components/OrgBilling/OrgMembersRoute'
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
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'OrgTeamMembers' */ '../../modules/userDashboard/components/OrgTeamMembers/OrgTeamMembersRoot'
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
export const timelineRoute = createRoute({
  getParentRoute: () => userDashMainLayoutRoute,
  path: '/',
  component: MyDashboardTimelineRoot
})
// Any other /me URL falls back to the timeline
export const timelineFallbackRoute = createRoute({
  getParentRoute: () => userDashMainLayoutRoute,
  path: '$',
  component: MyDashboardTimelineRoot
})
