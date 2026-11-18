import {createRoute, lazyRouteComponent, redirect} from '@tanstack/react-router'
import {rootRoute} from './rootRoute'

const DemoSummary = lazyRouteComponent(
  () => import(/* webpackChunkName: 'DemoSummary' */ '../../components/DemoSummary')
)
const ActivityLibraryRoute = lazyRouteComponent(
  () =>
    import(
      /* webpackChunkName: 'AcitivityLibraryRoute' */ '../../components/ActivityLibrary/ActivityLibraryRoute'
    )
)
const Graphql = lazyRouteComponent(
  () =>
    import(
      /* webpackChunkName: 'GraphqlContainer' */ '../../modules/admin/containers/Graphql/GraphqlContainer'
    )
)

// Any route that renders a useTipTapContext consumer must be a child of this one
export const tipTapLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'tipTapLayout',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'TipTapLayout' */ '../../components/TipTapLayout')
  )
})
export const retroDemoRoute = createRoute({
  getParentRoute: () => tipTapLayoutRoute,
  path: 'retrospective-demo',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'DemoMeeting' */ '../../components/DemoMeeting')
  )
})
// An index beside the phase splat, so a link to the bare URL matches the route it names
export const retroDemoIndexRoute = createRoute({
  getParentRoute: () => retroDemoRoute,
  path: '/'
})
export const retroDemoPhaseRoute = createRoute({
  getParentRoute: () => retroDemoRoute,
  path: '$'
})
export const retroDemoSummaryRoute = createRoute({
  getParentRoute: () => tipTapLayoutRoute,
  path: 'retrospective-demo-summary',
  component: DemoSummary
})
export const retroDemoSummaryActionRoute = createRoute({
  getParentRoute: () => tipTapLayoutRoute,
  path: 'retrospective-demo-summary/$urlAction',
  component: DemoSummary
})

export const privateLayoutRoute = createRoute({
  getParentRoute: () => tipTapLayoutRoute,
  id: 'privateLayout',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'PrivateRoutes' */ '../../components/PrivateRoutes')
  )
})
export const activityLibraryRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'activity-library'
})
export const activityLibraryIndexRoute = createRoute({
  getParentRoute: () => activityLibraryRoute,
  path: '/',
  component: ActivityLibraryRoute
})
export const activityLibraryCategoryRoute = createRoute({
  getParentRoute: () => activityLibraryRoute,
  path: 'category/$categoryId',
  component: ActivityLibraryRoute
})
export const activityDetailsRoute = createRoute({
  getParentRoute: () => activityLibraryRoute,
  path: 'details/$activityId',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'ActivityDetails' */ '../../components/ActivityLibrary/ActivityDetails/ActivityDetailsRoute'
      )
  )
})
export const newActivityRoute = createRoute({
  getParentRoute: () => activityLibraryRoute,
  path: 'new-activity/$categoryId',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'CreateNewActivityRoute' */ '../../components/ActivityLibrary/CreateNewActivity/CreateNewActivityRoute'
      )
  )
})
export const newMeetingRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'new-meeting',
  beforeLoad: () => {
    throw redirect({to: '/activity-library', replace: true})
  }
})
export const meetingRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'meet/$meetingId',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'MeetingRoot' */ '../../components/MeetingRoot')
  )
})
export const meetingIndexRoute = createRoute({
  getParentRoute: () => meetingRoute,
  path: '/'
})
export const meetingPhaseRoute = createRoute({
  getParentRoute: () => meetingRoute,
  path: '$'
})
export const meetingSeriesManagementRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'meeting-series/manage/$meetingSeriesId',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'MeetingSeriesManagementRoot' */ '../../components/MeetingSeriesManagementRoot'
      )
  )
})
export const meetingSeriesAttendRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'meeting-series/$slug',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'MeetingSeriesAttendRedirect' */ '../../components/MeetingSeriesAttendRedirect'
      )
  )
})
export const adminGraphqlRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'admin/graphql',
  component: Graphql
})
export const graphqlRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'graphql',
  component: Graphql
})
export const impersonateRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'admin/impersonate',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'ImpersonateContainer' */ '../../modules/admin/containers/Impersonate/ImpersonateContainer'
      )
  )
})
export const invitationRequiredRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'invitation-required',
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'ViewerNotOnTeamRoot' */ '../../components/ViewerNotOnTeamRoot')
  )
})
export const authorizeAppRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'authorize-app',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'OAuthAuthorizeRoot' */ '../../components/OAuthAuthorizeRoot')
  )
})
export const signoutRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'signout',
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'SignoutContainer' */ '../../containers/Signout/SignoutContainer')
  )
})
export const reviewRequestToJoinOrgRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'organization-join-request/$requestId',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'ReviewRequestToJoinOrgRoot' */ '../../components/ReviewRequestToJoinOrgRoute'
      )
  )
})
export const notFoundRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: '$',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'NotFound' */ '../../components/NotFound/NotFound')
  )
})
