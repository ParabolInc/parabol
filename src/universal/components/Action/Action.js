import React from 'react'
import styled from 'react-emotion'
import {Switch} from 'react-router-dom'
import AnalyticsIdentifierRoot from 'universal/components/AnalyticsIdentifierRoot'
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute'
import SocketHealthMonitor from 'universal/components/SocketHealthMonitor'
import Toast from 'universal/modules/toast/containers/Toast/Toast'
import {SIGNIN_SLUG, CREATE_ACCOUNT_SLUG} from 'universal/utils/constants'

const invoice = () =>
  import(/* webpackChunkName: 'InvoiceRoot' */ 'universal/modules/invoice/containers/InvoiceRoot')
const meetingSummary = () =>
  import(/* webpackChunkName: 'MeetingSummary' */ 'universal/modules/summary/components/MeetingSummaryRoot')
const newMeetingSummary = () =>
  import(/* webpackChunkName: 'NewMeetingSummaryRoot' */ 'universal/modules/summary/components/NewMeetingSummaryRoot')
const welcome = () =>
  import(/* webpackChunkName: 'WelcomeRoot' */ 'universal/modules/welcome/components/WelcomeRoot')
const graphql = () =>
  import(/* webpackChunkName: 'GraphqlContainer' */ 'universal/modules/admin/containers/Graphql/GraphqlContainer')
const impersonate = () =>
  import(/* webpackChunkName: 'ImpersonateContainer' */ 'universal/modules/admin/containers/Impersonate/ImpersonateContainer')
const invitation = () =>
  import(/* webpackChunkName: 'InvitationContainer' */ 'universal/modules/invitation/containers/Invitation/InvitationContainer')
const signout = () =>
  import(/* webpackChunkName: 'SignoutContainer' */ 'universal/containers/Signout/SignoutContainer')
const notFound = () =>
  import(/* webpackChunkName: 'NotFound' */ 'universal/components/NotFound/NotFound')
const dashWrapper = () =>
  import(/* webpackChunkName: 'DashboardWrapper' */ 'universal/components/DashboardWrapper/DashboardWrapper')
const meetingRoot = () =>
  import(/* webpackChunkName: 'MeetingRoot' */ 'universal/modules/meeting/components/MeetingRoot')
const resetPasswordPage = () =>
  import(/* webpackChunkName: 'ResetPasswordPage' */ 'universal/components/ResetPasswordPage/ResetPasswordPage')
const retroRoot = () =>
  import(/* webpackChunkName: 'RetroRoot' */ 'universal/components/RetroRoot/RetroRoot')
const createAccountPage = () =>
  import(/* webpackChunkName: 'CreateAccountPage' */ 'universal/components/CreateAccountPage/CreateAccountPage')
const signInPage = () =>
  import(/* webpackChunkName: 'SignInPage' */ 'universal/components/SignInPage/SignInPage')
const demoMeeting = () =>
  import(/* webpackChunkName: 'DemoMeeting' */ 'universal/components/DemoMeeting')
const demoSummary = () =>
  import(/* webpackChunkName: 'DemoSummary' */ 'universal/components/DemoSummary')

const ActionStyles = styled('div')({
  margin: 0,
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

const Action = () => {
  return (
    <ActionStyles>
      <Toast />
      <SocketHealthMonitor />
      <AnalyticsIdentifierRoot />
      <Switch>
        <AsyncRoute exact path='/' mod={signInPage} />
        <AsyncRoute exact path={`/${SIGNIN_SLUG}`} mod={signInPage} />
        <AsyncRoute exact path={`/${CREATE_ACCOUNT_SLUG}`} mod={createAccountPage} />
        <AsyncRoute exact path={`/${CREATE_ACCOUNT_SLUG}`} mod={createAccountPage} />
        <AsyncRoute
          path='/retrospective-demo/:localPhaseSlug?/:stageIdxSlug?'
          mod={demoMeeting}
          extraProps={{match: {params: {teamId: 'demoTeam'}}}}
        />
        <AsyncRoute path='/retrospective-demo-summary' mod={demoSummary} />
        <AsyncRoute exact path='/reset-password' mod={resetPasswordPage} />
        <AsyncRoute isPrivate path='(/me|/newteam|/team)' mod={dashWrapper} />
        <AsyncRoute
          isPrivate
          path='/meeting/:teamId/:localPhase?/:localPhaseItem?'
          mod={meetingRoot}
        />
        <AsyncRoute
          isPrivate
          path='/retro/:teamId/:localPhaseSlug?/:stageIdxSlug?'
          mod={retroRoot}
        />
        <AsyncRoute isPrivate path='/invoice/:invoiceId' mod={invoice} />
        <AsyncRoute isPrivate path='/summary/:meetingId' mod={meetingSummary} />
        <AsyncRoute isPrivate path='/new-summary/:meetingId' mod={newMeetingSummary} />
        <AsyncRoute isPrivate path='/welcome' mod={welcome} />
        <AsyncRoute path='/admin/graphql' mod={graphql} />
        <AsyncRoute path='/admin/impersonate/:newUserId' mod={impersonate} />
        <AsyncRoute path='/invitation/:inviteToken' mod={invitation} />
        <AsyncRoute mod={signout} />
        <AsyncRoute mod={notFound} />
      </Switch>
    </ActionStyles>
  )
}

export default Action
