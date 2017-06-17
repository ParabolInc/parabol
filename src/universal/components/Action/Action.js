import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import LandingContainer from 'universal/modules/landing/containers/Landing/LandingContainer';
import Toast from 'universal/modules/toast/containers/Toast/Toast';
import withStyles from 'universal/styles/withStyles';

const socketRoute = () => System.import('universal/components/SocketRoute/SocketRoute');
const invoice = () => System.import('universal/modules/invoice/containers/InvoiceContainer/InvoiceContainer');
const meetingSummary = () => System.import('universal/modules/summary/containers/MeetingSummary/MeetingSummaryContainer');
const welcome = () => System.import('universal/modules/welcome/containers/Welcome/Welcome');
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
      <Switch>
        <Route exact path="/" component={LandingContainer} />
        <AsyncRoute isPrivate path="(/me|/meeting|/newteam|/team)" mod={socketRoute} />
        <AsyncRoute bottom isPrivate path="/invoice/:invoiceId" mod={invoice} />
        <AsyncRoute bottom isPrivate path="/summary/:meetingId" mod={meetingSummary} />
        <AsyncRoute bottom isPrivate path="/welcome" mod={welcome} />
        <AsyncRoute bottom path="/admin/graphql" mod={graphql} />
        <AsyncRoute bottom path="/admin/impersonate/:newUserId" mod={impersonate} />
        <AsyncRoute bottom path="/invitation/:id" mod={invitation} />
        <AsyncRoute bottom mod={signout} />
        <AsyncRoute bottom mod={notFound} />
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

export default withStyles(styleThunk)(Action);
