import {Location} from 'history'
import {lazy} from 'react'
import {Redirect, Route, Switch, useLocation} from 'react-router'
import useAuthRoute from '../hooks/useAuthRoute'
import useNoIndex from '../hooks/useNoIndex'

const Graphql = lazy(
  () =>
    import(
      /* webpackChunkName: 'GraphqlContainer' */ '../modules/admin/containers/Graphql/GraphqlContainer'
    )
)
const Impersonate = lazy(
  () =>
    import(
      /* webpackChunkName: 'ImpersonateContainer' */ '../modules/admin/containers/Impersonate/ImpersonateContainer'
    )
)
const Signout = lazy(
  () => import(/* webpackChunkName: 'SignoutContainer' */ '../containers/Signout/SignoutContainer')
)
const NotFound = lazy(() => import(/* webpackChunkName: 'NotFound' */ './NotFound/NotFound'))
const DashboardRoot = lazy(() => import(/* webpackChunkName: 'DashboardRoot' */ './DashboardRoot'))
const MeetingRoot = lazy(() => import(/* webpackChunkName: 'MeetingRoot' */ './MeetingRoot'))
const MeetingSeriesRoot = lazy(
  () => import(/* webpackChunkName: 'MeetingSeriesRoot' */ './MeetingSeriesRoot')
)
const ViewerNotOnTeamRoot = lazy(
  () => import(/* webpackChunkName: 'ViewerNotOnTeamRoot' */ './ViewerNotOnTeamRoot')
)

const ActivityLibraryRoutes = lazy(
  () =>
    import(
      /* webpackChunkName: 'ActivityLibraryRoutes' */ './ActivityLibrary/ActivityLibraryRoutes'
    )
)

const ReviewRequestToJoinOrgRoot = lazy(
  () => import(/* webpackChunkName: 'ReviewRequestToJoinOrgRoot' */ './ReviewRequestToJoinOrgRoot')
)

const PrivateRoutes = () => {
  useAuthRoute()
  useNoIndex()
  const location = useLocation<{backgroundLocation?: Location}>()
  const state = location.state
  return (
    <>
      <Switch location={state?.backgroundLocation || location}>
        <Route path='/activity-library' component={ActivityLibraryRoutes} />
        <Route
          path='(/meetings|/me|/new-summary|/newteam|/team|/organization-join-request|/pages)'
          component={DashboardRoot}
        />
        <Route path='/new-meeting'>
          <Redirect to='/activity-library' />
        </Route>
        <Route path='/meet/:meetingId' component={MeetingRoot} />
        <Route path='/meeting-series/:meetingId' component={MeetingSeriesRoot} />
        <Route path='/admin/graphql' component={Graphql} />
        <Route path='/admin/impersonate' component={Impersonate} />
        <Route path='/invitation-required' component={ViewerNotOnTeamRoot} />
        <Route path='/signout' component={Signout} />
        <Route component={NotFound} />
      </Switch>
      <Switch>
        <Route
          path='/organization-join-request/:requestId'
          component={ReviewRequestToJoinOrgRoot}
        />
      </Switch>
    </>
  )
}

export default PrivateRoutes
