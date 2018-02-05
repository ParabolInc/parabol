import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import SocketHealthMonitor from 'universal/containers/SocketHealthMonitor/SocketHealthMonitor';
import LandingContainer from 'universal/modules/landing/containers/Landing/LandingContainer';
import Toast from 'universal/modules/toast/containers/Toast/Toast';
import Error404Container from 'universal/modules/error404/containers/Error404Container';
import withStyles from 'universal/styles/withStyles';

const socketRoute = () => System.import('universal/components/SocketRoute/SocketRoute');
const invoice = () => System.import('universal/modules/invoice/containers/InvoiceRoot');
const meetingSummary = () => System.import('universal/modules/summary/components/MeetingSummaryRoot');
const welcome = () => System.import('universal/modules/welcome/components/WelcomeRoot');
const graphql = () => System.import('universal/modules/admin/containers/Graphql/GraphqlContainer');
const impersonate = () => System.import('universal/modules/admin/containers/Impersonate/ImpersonateContainer');
const invitation = () => System.import('universal/modules/invitation/containers/Invitation/InvitationContainer');
const signout = () => System.import('universal/containers/Signout/SignoutContainer');
const notFound = () => System.import('universal/components/NotFound/NotFound');

const Action = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.app)}>
      <Toast />
      <SocketHealthMonitor />
      <Switch>
        <Route exact path="/" component={LandingContainer} />
        <Route exact path="/error" component={Error404Container} />
        <AsyncRoute isAbstract isPrivate path="(/me|/meeting|/newteam|/team)" mod={socketRoute} />
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

export Atmosphere from 'universal/Atmosphere';
export {StyleSheetServer} from 'aphrodite-local-styles/no-important';
export default withStyles(styleThunk)(Action);
