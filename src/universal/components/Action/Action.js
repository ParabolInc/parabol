import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Toast from 'universal/modules/toast/containers/Toast/Toast';
import {Route, Switch} from 'react-router-dom';
import LandingBundle from 'universal/modules/landing/containers/Landing/LandingBundle';
import WelcomeBundle from 'universal/modules/welcome/containers/Welcome/WelcomeBundle';
import SignoutBundle from '../../containers/Signout/SignoutBundle';
import NotFoundBundle from '../NotFound/NotFoundBundle';
import MeetingSummaryBundle from '../../modules/summary/containers/MeetingSummary/MeetingSummaryBundle';
import InvoiceBundle from '../../modules/invoice/containers/InvoiceContainer/InvoiceBundle';
import InvitationBundle from '../../modules/invitation/containers/Invitation/InvitationBundle';
import GraphqlBundle from '../../modules/admin/containers/Graphql/GraphqlBundle';
import ImpersonateBundle from '../../modules/admin/containers/Impersonate/ImpersonateBundle';
import SocketRouteBundle from '../SocketRoute/SocketRouteBundle';
import PrivateRoute from '../PrivateRoute/PrivateRoute';

const Action = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.app)}>
      <Toast />
      <Switch>
        <Route exact path="/" component={LandingBundle} />
        <PrivateRoute path="(/me|/meeting|/newteam|/team)" component={SocketRouteBundle} />
        <PrivateRoute path="/invoice/:invoiceId" component={InvoiceBundle} />
        <PrivateRoute path="/summary/:meetingId" component={MeetingSummaryBundle} />
        <PrivateRoute path="/welcome" component={WelcomeBundle} />
        <Route path="/admin/graphql" component={GraphqlBundle} />
        <Route path="/admin/impersonate/:newUserId" component={ImpersonateBundle} />
        <Route path="/invitation/:id" component={InvitationBundle} />
        <Route path="/signout" component={SignoutBundle} />
        <Route component={NotFoundBundle} />
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
