import React, {lazy} from 'react'
import {Route, Switch} from 'react-router'
import useAuthRoute from '../hooks/useAuthRoute'
import useNoIndex from '../hooks/useNoIndex'

const Invoice = lazy(
  () => import(/* webpackChunkName: 'InvoiceRoot' */ '../modules/invoice/containers/InvoiceRoot')
)
const NewMeetingSummary = lazy(
  () =>
    import(
      /* webpackChunkName: 'NewMeetingSummaryRoot' */ '../modules/summary/components/NewMeetingSummaryRoot'
    )
)
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

const PrivateRoutes = () => {
  useAuthRoute()
  useNoIndex()
  return (
    <Switch>
      <Route
        path='(/meetings|/me|/newteam|/team|/usage|/new-meeting|/activity-library)'
        component={DashboardRoot}
      />
      <Route path='/meet/:meetingId' component={MeetingRoot} />
      <Route path='/meeting-series/:meetingId' component={MeetingSeriesRoot} />
      <Route path='/invoice/:invoiceId' component={Invoice} />
      <Route path='/new-summary/:meetingId/:urlAction?' component={NewMeetingSummary} />
      <Route path='/admin/graphql' component={Graphql} />
      <Route path='/admin/impersonate' component={Impersonate} />
      <Route path='/invitation-required' component={ViewerNotOnTeamRoot} />
      <Route path='/signout' component={Signout} />
      <Route component={NotFound} />
    </Switch>
  )
}

export default PrivateRoutes
