import styled from 'react-emotion'
import React from 'react'
import {Route, Switch} from 'react-router-dom'
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute'
import Toast from 'universal/modules/toast/containers/Toast/Toast'
import SocketHealthMonitor from 'universal/components/SocketHealthMonitor'
import SignInPage from 'universal/components/SignInPage/SignInPage'
import AnalyticsIdentifierRoot from 'universal/components/AnalyticsIdentifierRoot'

const invoice = () =>
  import(/* webpackChunkName: 'InvoiceRoot' */ 'universal/modules/invoice/containers/InvoiceRoot')
const meetingSummary = () => import('universal/modules/summary/components/MeetingSummaryRoot')
const newMeetingSummary = () => import('universal/modules/summary/components/NewMeetingSummaryRoot')
const welcome = () => import('universal/modules/welcome/components/WelcomeRoot')
const graphql = () => import('universal/modules/admin/containers/Graphql/GraphqlContainer')
const impersonate = () =>
  import('universal/modules/admin/containers/Impersonate/ImpersonateContainer')
const invitation = () =>
  import('universal/modules/invitation/containers/Invitation/InvitationContainer')
const signout = () => import('universal/containers/Signout/SignoutContainer')
const notFound = () => import('universal/components/NotFound/NotFound')
const dashWrapper = () => import('universal/components/DashboardWrapper/DashboardWrapper')
const meetingRoot = () => import('universal/modules/meeting/components/MeetingRoot')
const resetPasswordPage = () => import('universal/components/ResetPasswordPage/ResetPasswordPage')
const retroRoot = () => import('universal/components/RetroRoot/RetroRoot')
const signUpPage = () => import('universal/components/SignUpPage/SignUpPage')

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
        <Route exact path='/' component={SignInPage} />
        <Route exact path='/signin' component={SignInPage} />
        <AsyncRoute exact path='/signup' mod={signUpPage} />
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
