import {createRoute, lazyRouteComponent} from '@tanstack/react-router'
import dashboardQuery, {type DashboardQuery} from '../../__generated__/DashboardQuery.graphql'
import newMeetingSummaryQuery, {
  type NewMeetingSummaryQuery
} from '../../__generated__/NewMeetingSummaryQuery.graphql'
import newTeamQuery, {type NewTeamQuery} from '../../__generated__/NewTeamQuery.graphql'
import pageEntryQuery, {type PageEntryQuery} from '../../__generated__/PageEntryQuery.graphql'
import reportPinQuery, {type ReportPinQuery} from '../../__generated__/ReportPinQuery.graphql'
import reportsHomeQuery, {type ReportsHomeQuery} from '../../__generated__/ReportsHomeQuery.graphql'
import reportsRedirectQuery, {
  type ReportsRedirectQuery
} from '../../__generated__/ReportsRedirectQuery.graphql'
import shareTopicModalQuery, {
  type ShareTopicModalQuery
} from '../../__generated__/ShareTopicModalQuery.graphql'
import findReportPin from '../../modules/reports/findReportPin'
import loadReportPageQuery from '../../modules/reports/loadReportPageQuery'
import {parseReportPeriodParam} from '../../modules/reports/reportPeriodParam'
import {readReportSpecParams} from '../../modules/reports/reportSpecParam'
import {GQLID} from '../../utils/GQLID'
import {privateLayoutRoute} from './privateRoutes'

export const dashboardLayoutRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  id: 'dashboardLayout',
  loader: async ({context: {atmosphere, queryRefs}}) => {
    // Only a public page reaches the dashboard signed out, and it renders without it
    if (!atmosphere.authObj) return {queryRef: null}
    // relay-compiler strips null literals (facebook/relay#4488), so null rides in as a variable
    const variables = {first: 5, nullId: null}
    return {queryRef: await queryRefs.load<DashboardQuery>(dashboardQuery, variables)}
  },
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'DashboardLayout' */ '../../components/DashboardLayout')
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
  loader: async ({context: {queryRefs}}) => ({
    queryRef: await queryRefs.load<NewTeamQuery>(newTeamQuery, {})
  }),
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'NewTeamRoute' */ '../../modules/newTeam/NewTeamRoute')
  )
})
export const newTeamIndexRoute = createRoute({
  getParentRoute: () => newTeamRoute,
  path: '/'
})
export const newTeamInOrgRoute = createRoute({
  getParentRoute: () => newTeamRoute,
  path: '$defaultOrgId'
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
  // A public page loads signed out too
  loader: async ({context: {queryRefs}, params: {pageSlug}}) => {
    // The slug ends in the page's code, after a readable title
    const pageId = GQLID.toKey(pageSlug.slice(pageSlug.lastIndexOf('-') + 1), 'page')
    return {pageId, queryRef: await queryRefs.load<PageEntryQuery>(pageEntryQuery, {pageId})}
  },
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'PageRoute' */ '../../modules/pages/PageRoute')
  )
})
export const reportsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'reports',
  loader: async ({context: {queryRefs}}) => ({
    queryRef: await queryRefs.load<ReportsRedirectQuery>(reportsRedirectQuery, {})
  }),
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'ReportsRoute' */ '../../modules/reports/ReportsRoute')
  )
})
export const reportsHomeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'reports/$orgId',
  loaderDeps: ({search}) => ({search}),
  loader: async ({context: {queryRefs}, params: {orgId}, location}) => {
    const period = new URLSearchParams(location.searchStr).get('period')
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const variables = {orgId, timeZone, pagePeriod: parseReportPeriodParam(period)}
    return {
      queryRef: await queryRefs.load<ReportsHomeQuery>(reportsHomeQuery, variables, {
        fetchPolicy: 'network-only'
      })
    }
  },
  // The last period's numbers stay up while the next period loads
  pendingMs: Number.POSITIVE_INFINITY,
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'ReportsHomeRoute' */ '../../modules/reports/ReportsHomeRoute')
  )
})
export const reportPageRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'reports/$orgId/report',
  // The question only names the report, so naming it once the server answers keeps the results
  loaderDeps: ({search}) => ({...search, question: undefined}),
  loader: async ({context: {queryRefs}, params: {orgId}, location}) => {
    const searchParams = new URLSearchParams(location.searchStr)
    const spec = readReportSpecParams(searchParams)
    const period = parseReportPeriodParam(searchParams.get('period'))
    return {queryRef: spec ? await loadReportPageQuery(queryRefs, orgId, spec, period) : null}
  },
  // The last results stay up, marked out of date, while a changed report loads
  pendingMs: Number.POSITIVE_INFINITY,
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'ReportPageRoute' */ '../../modules/reports/ReportPageRoute')
  )
})
export const reportPinRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'reports/$orgId/pins/$pinParam',
  loaderDeps: ({search}) => ({search}),
  loader: async ({context: {atmosphere, queryRefs}, params: {orgId, pinParam}, location}) => {
    // The pin holds its report's spec, so the report's results wait for the pin
    const queryRef = await queryRefs.load<ReportPinQuery>(reportPinQuery, {orgId})
    const pinResponse = await atmosphere.fetchQuery<ReportPinQuery>(reportPinQuery, {orgId})
    const reportPin =
      pinResponse instanceof Error
        ? null
        : findReportPin(pinResponse.viewer.organization?.pinnedReports, pinParam)
    const period = parseReportPeriodParam(new URLSearchParams(location.searchStr).get('period'))
    return {
      queryRef,
      reportQueryRef: reportPin
        ? await loadReportPageQuery(queryRefs, orgId, reportPin.spec, period)
        : null
    }
  },
  // The last period's numbers stay up while the next period loads
  pendingMs: Number.POSITIVE_INFINITY,
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'ReportPinRoute' */ '../../modules/reports/ReportPinRoute')
  )
})
export const meetingSummaryRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'new-summary/$meetingId',
  loader: async ({context: {queryRefs}, params: {meetingId}}) => ({
    queryRef: await queryRefs.load<NewMeetingSummaryQuery>(newMeetingSummaryQuery, {
      meetingId,
      first: 5,
      nullId: null
    })
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'NewMeetingSummaryRoute' */ '../../modules/summary/components/NewMeetingSummaryRoute'
      )
  )
})
export const meetingSummaryIndexRoute = createRoute({
  getParentRoute: () => meetingSummaryRoute,
  path: '/'
})
export const meetingSummaryActionRoute = createRoute({
  getParentRoute: () => meetingSummaryRoute,
  path: '$urlAction'
})
export const shareTopicRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'new-summary/$meetingId/share/$stageId',
  loader: async ({context: {queryRefs}, params: {meetingId}}) => ({
    queryRef: await queryRefs.load<ShareTopicModalQuery>(
      shareTopicModalQuery,
      {meetingId},
      {fetchPolicy: 'network-only'}
    )
  }),
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'ShareTopicRoute' */ '../../components/ShareTopicRoute')
  )
})
