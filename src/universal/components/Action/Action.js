import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import DynamicHome from 'universal/components/DynamicHome/DynamicHome';
import LandingContainer from 'universal/modules/landing/containers/Landing/LandingContainer';
import Toast from 'universal/modules/toast/containers/Toast/Toast';
import withStyles from 'universal/styles/withStyles';
import SocketHealthMonitor from 'universal/components/SocketHealthMonitor';
import SignIn from 'universal/components/SignIn/SignIn';
import {StyleSheetServer as S} from 'aphrodite-local-styles/no-important';
import A from 'universal/Atmosphere';

const invoice = () => System.import('universal/modules/invoice/containers/InvoiceRoot');
const meetingSummary = () => System.import('universal/modules/summary/components/MeetingSummaryRoot');
const welcome = () => System.import('universal/modules/welcome/components/WelcomeRoot');
const graphql = () => System.import('universal/modules/admin/containers/Graphql/GraphqlContainer');
const impersonate = () => System.import('universal/modules/admin/containers/Impersonate/ImpersonateContainer');
const invitation = () => System.import('universal/modules/invitation/containers/Invitation/InvitationContainer');
const signout = () => System.import('universal/containers/Signout/SignoutContainer');
const notFound = () => System.import('universal/components/NotFound/NotFound');
const dashWrapper = () => System.import('universal/components/DashboardWrapper/DashboardWrapper');
const meetingRoot = () => System.import('universal/modules/meeting/components/MeetingRoot');
const signInPage = () => System.import('universal/components/SignInPage/SignInPage');

const Action = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.app)}>
      <Toast />
      <SocketHealthMonitor />
      <Switch>
        {__RELEASE_FLAGS__.newSignIn
          ? <Route exact path="/" component={DynamicHome} />
          : <Route exact path="/" component={LandingContainer} />
        }
        {__RELEASE_FLAGS__.newSignIn &&
          <AsyncRoute exact path="/signin" mod={signInPage} />
        }
        <AsyncRoute isAbstract isPrivate path="(/me|/newteam|/team)" mod={dashWrapper} />
        <AsyncRoute isPrivate path="/meeting/:teamId/:localPhase?/:localPhaseItem?" mod={meetingRoot} />
        <AsyncRoute isPrivate path="/invoice/:invoiceId" mod={invoice} />
        <AsyncRoute isPrivate path="/summary/:meetingId" mod={meetingSummary} />
        <AsyncRoute isPrivate path="/welcome" mod={welcome} />
        <AsyncRoute path="/admin/graphql" mod={graphql} />
        <AsyncRoute path="/admin/impersonate/:newUserId" mod={impersonate} />
        <AsyncRoute path="/invitation/:id" mod={invitation} />
        <AsyncRoute mod={signout} />
        <AsyncRoute mod={notFound} />
      </Switch>
    </div>
  );
};

Action.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  app: {
    margin: 0,
    minHeight: '100vh',
    padding: 0,
    width: '100%'
  }
});

export const Atmosphere = A;
export const StyleSheetServer = S;
export default withStyles(styleThunk)(Action);
