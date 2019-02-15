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
const DashWrapper = lazy(() =>
  import(/* webpackChunkName: 'DashboardWrapper' */ 'universal/components/DashboardWrapper/DashboardWrapper')
)
const MeetingRoot = lazy(() =>
  import(/* webpackChunkName: 'MeetingRoot' */ 'universal/modules/meeting/components/MeetingRoot')
)
const RetroRoot = lazy(() =>
  import(/* webpackChunkName: 'RetroRoot' */ 'universal/components/RetroRoot/RetroRoot')
)

const PrivateRoutes = () => {
  return (
    <Switch>
      <Route isPrivate path='(/me|/newteam|/team)' component={DashWrapper} />
      <Route
        isPrivate
        path='/meeting/:teamId/:localPhase?/:localPhaseItem?'
        component={MeetingRoot}
      />
      <Route
        isPrivate
        path='/retro/:teamId/:localPhaseSlug?/:stageIdxSlug?'
        component={RetroRoot}
      />
      <Route isPrivate path='/invoice/:invoiceId' component={Invoice} />
      <Route isPrivate path='/summary/:meetingId' component={MeetingSummary} />
      <Route isPrivate path='/new-summary/:meetingId/:urlAction?' component={NewMeetingSummary} />
      <Route path='/admin/graphql' component={Graphql} />
      <Route path='/admin/impersonate/:newUserId' component={Impersonate} />
      <Route component={Signout} />
      <Route component={NotFound} />
    </Switch>
  )
}

export default requireAuth(PrivateRoutes)
