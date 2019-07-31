import React, {lazy} from 'react'
import {Route, Switch} from 'react-router'
import useAuthRoute from '../hooks/useAuthRoute'

const Invoice = lazy(() =>
  import(/* webpackChunkName: 'InvoiceRoot' */ '../modules/invoice/containers/InvoiceRoot')
)
const NewMeetingSummary = lazy(() =>
  import(
    /* webpackChunkName: 'NewMeetingSummaryRoot' */ '../modules/summary/components/NewMeetingSummaryRoot'
  )
)
const Graphql = lazy(() =>
  import(
    /* webpackChunkName: 'GraphqlContainer' */ '../modules/admin/containers/Graphql/GraphqlContainer'
  )
)
const Impersonate = lazy(() =>
  import(
    /* webpackChunkName: 'ImpersonateContainer' */ '../modules/admin/containers/Impersonate/ImpersonateContainer'
  )
)
const Signout = lazy(() =>
  import(/* webpackChunkName: 'SignoutContainer' */ '../containers/Signout/SignoutContainer')
)
const NotFound = lazy(() =>
  import(/* webpackChunkName: 'NotFound' */ './NotFound/NotFound')
)
const DashboardRoot = lazy(() =>
  import(/* webpackChunkName: 'DashboardRoot' */ './DashboardRoot')
)
const ActionMeetingRoot = lazy(() =>
  import(/* webpackChunkName: 'ActionMeetingRoot' */ './ActionMeetingRoot')
)
const RetroRoot = lazy(() =>
  import(/* webpackChunkName: 'RetroRoot' */ './RetroRoot/RetroRoot')
)
const ViewerNotOnTeamRoot = lazy(() =>
  import(/* webpackChunkName: 'ViewerNotOnTeamRoot' */ './ViewerNotOnTeamRoot')
)

const PrivateRoutes = () => {
  useAuthRoute()
  return (
    <Switch>
      <Route path='(/me|/newteam|/team)' component={DashboardRoot} />
      <Route
        path='/meeting/:teamId/:localPhaseSlug?/:stageIdxSlug?'
        component={ActionMeetingRoot}
      />
      <Route path='/retro/:teamId/:localPhaseSlug?/:stageIdxSlug?' component={RetroRoot} />
      <Route path='/invoice/:invoiceId' component={Invoice} />
      <Route path='/new-summary/:meetingId/:urlAction?' component={NewMeetingSummary} />
      <Route path='/admin/graphql' component={Graphql} />
      <Route path='/admin/impersonate/:newUserId' component={Impersonate} />
      <Route path='/invitation-required/:teamId' component={ViewerNotOnTeamRoot} />
      <Route path='/signout' component={Signout} />
      <Route component={NotFound} />
    </Switch>
  )
}

export default PrivateRoutes
