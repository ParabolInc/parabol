import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Toast from 'universal/modules/toast/containers/Toast/Toast';
import {Route, Switch} from 'react-router-dom';
import LandingContainer from 'universal/modules/landing/containers/Landing/LandingContainer';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';

const Action = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.app)}>
      <Toast />
      <Switch>
        <Route exact path="/" component={LandingContainer} />
        <AsyncRoute
          isPrivate
          path="(/me|/meeting|/newteam|/team)"
          mod={() => System.import('universal/components/SocketRoute/SocketRoute')}
        />
        <AsyncRoute
          isPrivate
          path="/invoice/:invoiceId"
          mod={() => System.import('universal/modules/invoice/containers/InvoiceContainer/InvoiceContainer')}
        />
        <AsyncRoute
          isPrivate
          path="/summary/:meetingId"
          mod={() => System.import('universal/modules/summary/containers/MeetingSummary/MeetingSummaryContainer')}
        />
        <AsyncRoute
          isPrivate
          path="/welcome"
          mod={() => System.import('universal/modules/welcome/containers/Welcome/Welcome')}
        />
        <AsyncRoute
          path="/admin/graphql"
          mod={() => System.import('universal/modules/admin/containers/Graphql/GraphqlContainer')}
        />
        <AsyncRoute
          path="/admin/impersonate/:newUserId"
          mod={() => System.import('universal/modules/admin/containers/Impersonate/ImpersonateContainer')}
        />
        <AsyncRoute
          path="/invitation/:id"
          mod={() => System.import('universal/modules/invitation/containers/Invitation/InvitationContainer')}
        />
        <AsyncRoute
          path="/signout"
          mod={() => System.import('universal/containers/Signout/SignoutContainer')}
        />
        <AsyncRoute
          mod={() => System.import('universal/components/NotFound/NotFound')}
        />
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
