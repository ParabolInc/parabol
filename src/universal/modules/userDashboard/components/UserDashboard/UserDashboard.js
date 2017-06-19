import PropTypes from 'prop-types';
import React from 'react';
import {Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import userDashReducer from 'universal/modules/userDashboard/ducks/userDashDuck';
import withReducer from '../../../../decorators/withReducer/withReducer';

const organizations = () => System.import('universal/modules/userDashboard/containers/Organizations/OrganizationsContainer');
const organization = () => System.import('universal/modules/userDashboard/containers/Organization/OrganizationContainer');
const userDashMain = () => System.import('universal/modules/userDashboard/components/UserDashMain/UserDashMain');
const userSettings = () => System.import('universal/modules/userDashboard/containers/UserSettings/UserSettingsContainer');
const notifications = () => System.import('universal/modules/notifications/containers/Notifications/NotificationsContainer');

const UserDashboard = (props) => {
  const {match} = props;
  return (
    <Switch>
      <AsyncRoute bottom exact path={match.url} mod={userDashMain} />
      <AsyncRoute bottom path={`${match.url}/settings`} mod={userSettings} />
      <AsyncRoute bottom exact path={`${match.url}/organizations`} mod={organizations} />
      <AsyncRoute bottom path={`${match.url}/organizations/:orgId/:orgArea?`} mod={organization} />
      <AsyncRoute bottom path={`${match.url}/notifications`} mod={notifications} />
    </Switch>
  );
};

UserDashboard.propTypes = {
  match: PropTypes.object.isRequired
};

export default withReducer({userDashboard: userDashReducer})(
  UserDashboard
);
