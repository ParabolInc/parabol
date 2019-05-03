import React, {lazy} from 'react'
import {Route, Switch} from 'react-router'
import requireAuth from 'universal/decorators/requireAuth/requireAuth'

const Invoice = lazy(() =>
  import(/* webpackChunkName: 'InvoiceRoot' */ 'universal/modules/invoice/containers/InvoiceRoot')
)
const MeetingSummary = lazy(() =>
  import(/* webpackChunkName: 'MeetingSummary' */ 'universal/modules/summary/components/MeetingSummaryRoot')
)
const NewMeetingSummary = lazy(() =>
  import(/* webpackChunkName: 'NewMeetingSummaryRoot' */ 'universal/modules/summary/components/NewMeetingSummaryRoot')
)
const Graphql = lazy(() =>
  import(/* webpackChunkName: 'GraphqlContainer' */ 'universal/modules/admin/containers/Graphql/GraphqlContainer')
)
const Impersonate = lazy(() =>
  import(/* webpackChunkName: 'ImpersonateContainer' */ 'universal/modules/admin/containers/Impersonate/ImpersonateContainer')
)
const Signout = lazy(() =>
  import(/* webpackChunkName: 'SignoutContainer' */ 'universal/containers/Signout/SignoutContainer')
)
const NotFound = lazy(() =>
  import(/* webpackChunkName: 'NotFound' */ 'universal/components/NotFound/NotFound')
)
const DashboardRoot = lazy(() =>
  import(/* webpackChunkName: 'DashboardRoot' */ 'universal/components/DashboardRoot')
)
const ActionMeetingRoot = lazy(() =>
  import(/* webpackChunkName: 'ActionMeetingRoot' */ 'universal/components/ActionMeetingRoot')
)
const RetroRoot = lazy(() =>
  import(/* webpackChunkName: 'RetroRoot' */ 'universal/components/RetroRoot/RetroRoot')
)
const ViewerNotOnTeamRoot = lazy(() =>
  import(/* webpackChunkName: 'ViewerNotOnTeamRoot' */ 'universal/components/ViewerNotOnTeamRoot')
)

const PrivateRoutes = () => {
  return (
    <Switch>
      <Route path='(/me|/newteam|/team)' component={DashboardRoot} />
      <Route
        path='/meeting/:teamId/:localPhaseSlug?/:stageIdxSlug?'
        component={ActionMeetingRoot}
      />
      <Route path='/retro/:teamId/:localPhaseSlug?/:stageIdxSlug?' component={RetroRoot} />
      <Route path='/invoice/:invoiceId' component={Invoice} />
      <Route path='/summary/:meetingId' component={MeetingSummary} />
      <Route path='/new-summary/:meetingId/:urlAction?' component={NewMeetingSummary} />
      <Route path='/admin/graphql' component={Graphql} />
      <Route path='/admin/impersonate/:newUserId' component={Impersonate} />
      <Route path='/invitation-required/:teamId' component={ViewerNotOnTeamRoot} />
      <Route path='/signout' component={Signout} />
      <Route component={NotFound} />
    </Switch>
  )
}

export default requireAuth(PrivateRoutes)
