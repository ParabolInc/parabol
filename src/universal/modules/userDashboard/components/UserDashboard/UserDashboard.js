import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import userDashReducer from 'universal/modules/userDashboard/ducks/userDashDuck';
import withReducer from '../../../../decorators/withReducer/withReducer';

class UserDashboard extends Component {
  shouldComponentUpdate() {
    // https://github.com/ReactTraining/react-router/issues/5099
    return false;
  }

  render() {
    const {match} = this.props;
    return (
      <Switch>
        <AsyncRoute
          exact
          path={match.url}
          mod={() => System.import('universal/modules/userDashboard/components/UserDashMain/UserDashMain')}
        />
        <AsyncRoute
          path={`${match.url}/settings`}
          mod={() => System.import('universal/modules/userDashboard/containers/UserSettings/UserSettingsContainer')}
        />
        <AsyncRoute
          exact
          path={`${match.url}/organizations`}
          mod={() => System.import('universal/modules/userDashboard/containers/Organizations/OrganizationsContainer')}
        />
        <AsyncRoute
          path={`${match.url}/organizations/:orgId/:orgArea?`}
          mod={() => System.import('universal/modules/userDashboard/containers/Organization/OrganizationContainer')}
        />
        <AsyncRoute
          path={`${match.url}/notifications`}
          mod={() => System.import('universal/modules/notifications/containers/Notifications/NotificationsContainer')}
        />
      </Switch>
    );
  }
}

UserDashboard.propTypes = {
  match: PropTypes.object.isRequired
};

export default withReducer({userDashboard: userDashReducer})(
  UserDashboard
);
