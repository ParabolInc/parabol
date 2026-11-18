import {createRoute, lazyRouteComponent} from '@tanstack/react-router'
import dashboardQuery, {type DashboardQuery} from '../../__generated__/DashboardQuery.graphql'
import {holdForData, loadRouteQuery} from '../routeQueries'
import {privateLayoutRoute} from './privateRoutes'

const NewTeam = lazyRouteComponent(
  () =>
    import(
      /* webpackChunkName: 'NewTeamRoot' */ '../../modules/newTeam/containers/NewTeamForm/NewTeamRoot'
    )
)
const NewMeetingSummary = lazyRouteComponent(
  () =>
    import(
      /* webpackChunkName: 'NewMeetingSummaryRoot' */ '../../modules/summary/components/NewMeetingSummaryRoot'
    )
)

export const dashboardLayoutRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  id: 'dashboardLayout',
  loader: ({context: {atmosphere}}) => {
    if (!atmosphere.authObj) return
    return holdForData([
      loadRouteQuery<DashboardQuery>(atmosphere, dashboardQuery, {first: 5, nullId: null})
    ])
  },
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'DashboardRoot' */ '../../components/DashboardLayout')
  )
})
export const meetingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'meetings',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'MeetingsDash' */ '../../components/MeetingsDashRoute')
  )
})
// Outside the team route, whose query sends people without access to the team elsewhere
export const requestToJoinTeamRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'team/$teamId/requestToJoin',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'RequestToJoinRoute' */ '../../components/RequestToJoinRoute')
  )
})
export const newTeamRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'newteam',
  component: NewTeam
})
export const newTeamInOrgRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'newteam/$defaultOrgId',
  component: NewTeam
})
export const makePageRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'pages',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'MakePage' */ '../../modules/pages/MakePage')
  )
})
// /pages/$pageSlug stays under the dashboard so the left nav keeps which teams & pages are expanded
export const pageRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'pages/$pageSlug',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'PageRoot' */ '../../modules/pages/PageRoute')
  )
})
export const reportsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'reports',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'ReportsRoot' */ '../../modules/reports/ReportsRoot')
  )
})
export const reportsHomeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'reports/$orgId',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'ReportsHomeRoot' */ '../../modules/reports/ReportsHomeRoot')
  )
})
export const reportPageRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'reports/$orgId/report',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'ReportPageRoot' */ '../../modules/reports/ReportPageRoot')
  )
})
export const reportPinRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'reports/$orgId/pins/$pinParam',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'ReportPinRoot' */ '../../modules/reports/ReportPinRoot')
  )
})
export const meetingSummaryRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'new-summary/$meetingId',
  component: NewMeetingSummary
})
export const meetingSummaryActionRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'new-summary/$meetingId/$urlAction',
  component: NewMeetingSummary
})
export const shareTopicRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'new-summary/$meetingId/share/$stageId',
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'ShareTopicRouterRoot' */ '../../components/ShareTopicRouterRoot')
  )
})
