import {createRoute, lazyRouteComponent, redirect} from '@tanstack/react-router'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {parseMeetingSeriesIdFromSlug} from 'parabol-client/shared/meetingSeriesSlug'
import activityDetailsQuery, {
  type ActivityDetailsQuery
} from '../../__generated__/ActivityDetailsQuery.graphql'
import activityLibraryQuery, {
  type ActivityLibraryQuery
} from '../../__generated__/ActivityLibraryQuery.graphql'
import createNewActivityQuery, {
  type CreateNewActivityQuery
} from '../../__generated__/CreateNewActivityQuery.graphql'
import meetingSeriesAttendRedirectQuery, {
  type MeetingSeriesAttendRedirectQuery
} from '../../__generated__/MeetingSeriesAttendRedirectQuery.graphql'
import meetingSeriesManagementPageQuery, {
  type MeetingSeriesManagementPageQuery
} from '../../__generated__/MeetingSeriesManagementPageQuery.graphql'
import oAuthAuthorizeQuery, {
  type OAuthAuthorizeQuery
} from '../../__generated__/OAuthAuthorizeQuery.graphql'
import viewerNotOnTeamQuery, {
  type ViewerNotOnTeamQuery
} from '../../__generated__/ViewerNotOnTeamQuery.graphql'
import {rootRoute} from './rootRoute'

const DemoSummary = lazyRouteComponent(
  () => import(/* webpackChunkName: 'DemoSummary' */ '../../components/DemoSummary')
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
  // A signed-out visitor goes to sign in before any page's data loads, except to read a public page
  beforeLoad: ({context: {atmosphere}, location, matches}) => {
    const {authObj} = atmosphere
    if (authObj && authObj.exp > Date.now() / 1000) return
    const isPublicPage = matches.some(
      ({routeId}) => routeId === '/tipTapLayout/privateLayout/dashboardLayout/pages/$pageSlug'
    )
    if (!authObj && isPublicPage) return
    throw redirect({
      href: `/?redirectTo=${encodeURIComponent(location.pathname)}`,
      replace: true,
      // an expired session is already ending with a message of its own
      state: {isSignInRequired: !authObj}
    })
  },
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'PrivateRoutes' */ '../../components/PrivateRoutes')
  )
})
export const activityLibraryRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'activity-library'
})
// The library and its categories share one query
export const activityLibraryHomeRoute = createRoute({
  getParentRoute: () => activityLibraryRoute,
  id: 'activityLibraryHome',
  loader: async ({context: {queryRefs}}) => ({
    queryRef: await queryRefs.load<ActivityLibraryQuery>(activityLibraryQuery, {})
  }),
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'ActivityLibraryRoute' */ '../../components/ActivityLibrary/ActivityLibraryRoute'
      )
  )
})
export const activityLibraryIndexRoute = createRoute({
  getParentRoute: () => activityLibraryHomeRoute,
  path: '/'
})
export const activityLibraryCategoryRoute = createRoute({
  getParentRoute: () => activityLibraryHomeRoute,
  path: 'category/$categoryId'
})
export const activityDetailsRoute = createRoute({
  getParentRoute: () => activityLibraryRoute,
  path: 'details/$activityId',
  loader: async ({context: {queryRefs}, params: {activityId}}) => ({
    queryRef: await queryRefs.load<ActivityDetailsQuery>(activityDetailsQuery, {activityId})
  }),
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
  loader: async ({context: {queryRefs}}) => ({
    queryRef: await queryRefs.load<CreateNewActivityQuery>(createNewActivityQuery, {})
  }),
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
  // everyone in the meeting sees the viewer join, so only a visit joins, never a preload
  preload: false,
  // The viewer stays joined until the router drops this match and aborts its loader, as soon as another page
  // commits. A gcTime would keep the match, and the viewer joined, that much longer
  loader: async ({
    context: {atmosphere, navigate, queryRefs},
    params: {meetingId},
    abortController
  }) => {
    // the subscription and the meeting query are too big for the entry bundle
    const {default: joinMeeting} = await import(
      /* webpackChunkName: 'joinMeeting' */ '../joinMeeting'
    )
    return {
      queryRef: await joinMeeting(
        atmosphere,
        {navigate},
        queryRefs,
        meetingId,
        abortController.signal
      )
    }
  },
  // a meeting replaces the whole page, so the page that opened it stays up until the meeting can show
  pendingMs: Number.POSITIVE_INFINITY,
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'MeetingRoute' */ '../../components/MeetingRoute')
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
  loader: async ({context: {queryRefs}, params}) => {
    const rawId = parseMeetingSeriesIdFromSlug(params.meetingSeriesId)
    const meetingSeriesId = rawId != null ? MeetingSeriesId.join(rawId) : ''
    return {
      queryRef: await queryRefs.load<MeetingSeriesManagementPageQuery>(
        meetingSeriesManagementPageQuery,
        {meetingSeriesId}
      )
    }
  },
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'MeetingSeriesManagementRoute' */ '../../components/MeetingSeriesManagementRoute'
      )
  )
})
export const meetingSeriesAttendRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'meeting-series/$slug',
  loader: async ({context: {queryRefs}, params: {slug}}) => {
    const rawId = parseMeetingSeriesIdFromSlug(slug)
    if (rawId == null) throw redirect({to: '/meetings', replace: true})
    const meetingSeriesId = MeetingSeriesId.join(rawId)
    return {
      queryRef: await queryRefs.load<MeetingSeriesAttendRedirectQuery>(
        meetingSeriesAttendRedirectQuery,
        {meetingSeriesId}
      )
    }
  },
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
  loaderDeps: ({search}) => ({search}),
  loader: async ({context: {queryRefs}, location}) => {
    const searchParams = new URLSearchParams(location.searchStr)
    const variables = {teamId: searchParams.get('teamId'), meetingId: searchParams.get('meetingId')}
    return {queryRef: await queryRefs.load<ViewerNotOnTeamQuery>(viewerNotOnTeamQuery, variables)}
  },
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'ViewerNotOnTeamRoute' */ '../../components/ViewerNotOnTeamRoute')
  )
})
export const authorizeAppRoute = createRoute({
  getParentRoute: () => privateLayoutRoute,
  path: 'authorize-app',
  loaderDeps: ({search}) => ({search}),
  loader: async ({context: {queryRefs}, location}) => {
    const searchParams = new URLSearchParams(location.searchStr)
    const request = {
      clientId: searchParams.get('client_id') ?? '',
      redirectUri: searchParams.get('redirect_uri') ?? '',
      scope: searchParams.get('scope'),
      state: searchParams.get('state') ?? '',
      codeChallenge: searchParams.get('code_challenge'),
      codeChallengeMethod: searchParams.get('code_challenge_method'),
      resource: searchParams.get('resource')
    }
    const queryRef = await queryRefs.load<OAuthAuthorizeQuery>(
      oAuthAuthorizeQuery,
      {request},
      {fetchPolicy: 'network-only'}
    )
    return {queryRef, request}
  },
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'OAuthAuthorizeRoute' */ '../../components/OAuthAuthorizeRoute')
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
