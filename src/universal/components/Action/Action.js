import styled from 'react-emotion';
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import Toast from 'universal/modules/toast/containers/Toast/Toast';
import SocketHealthMonitor from 'universal/components/SocketHealthMonitor';
import {StyleSheetServer as S} from 'aphrodite-local-styles/no-important';
import A from 'universal/Atmosphere';
import SignInPage from 'universal/components/SignInPage/SignInPage';

const invoice = () => System.import('universal/modules/invoice/containers/InvoiceRoot');
const meetingSummary = () => System.import('universal/modules/summary/components/MeetingSummaryRoot');
const newMeetingSummary = () => System.import('universal/modules/summary/components/NewMeetingSummaryRoot');
const welcome = () => System.import('universal/modules/welcome/components/WelcomeRoot');
const graphql = () => System.import('universal/modules/admin/containers/Graphql/GraphqlContainer');
const impersonate = () => System.import('universal/modules/admin/containers/Impersonate/ImpersonateContainer');
const invitation = () => System.import('universal/modules/invitation/containers/Invitation/InvitationContainer');
const signout = () => System.import('universal/containers/Signout/SignoutContainer');
const notFound = () => System.import('universal/components/NotFound/NotFound');
const dashWrapper = () => System.import('universal/components/DashboardWrapper/DashboardWrapper');
const meetingRoot = () => System.import('universal/modules/meeting/components/MeetingRoot');
const resetPasswordPage = () => System.import('universal/components/ResetPasswordPage/ResetPasswordPage');
const retroRoot = () => System.import('universal/components/RetroRoot/RetroRoot');
const signUpPage = () => System.import('universal/components/SignUpPage/SignUpPage');

const ActionStyles = styled('div')({
  margin: 0,
  minHeight: '100vh',
  padding: 0,
  width: '100%'
});

const Action = () => {
  return (
    <ActionStyles>
      <Toast />
      <SocketHealthMonitor />
      <Switch>
        <Route exact path="/" component={SignInPage} />
        <Route exact path="/signin" component={SignInPage} />
        <AsyncRoute exact path="/signup" mod={signUpPage} />
        <AsyncRoute exact path="/reset-password" mod={resetPasswordPage} />
        <AsyncRoute isAbstract isPrivate path="(/me|/newteam|/team)" mod={dashWrapper} />
        <AsyncRoute isPrivate path="/meeting/:teamId/:localPhase?/:localPhaseItem?" mod={meetingRoot} />
        <AsyncRoute isPrivate path="/retro/:teamId/:localPhaseSlug?/:stageIdxSlug?" mod={retroRoot} />
        <AsyncRoute isPrivate path="/invoice/:invoiceId" mod={invoice} />
        <AsyncRoute isPrivate path="/summary/:meetingId" mod={meetingSummary} />
        <AsyncRoute isPrivate path="/new-summary/:meetingId" mod={newMeetingSummary} />
        <AsyncRoute isPrivate path="/welcome" mod={welcome} />
        <AsyncRoute path="/admin/graphql" mod={graphql} />
        <AsyncRoute path="/admin/impersonate/:newUserId" mod={impersonate} />
        <AsyncRoute isPrivate path="/invitation/:inviteToken" mod={invitation} />
        <AsyncRoute mod={signout} />
        <AsyncRoute mod={notFound} />
      </Switch>
    </ActionStyles>
  );
};

export const Atmosphere = A;
export const StyleSheetServer = S;
export default Action;
