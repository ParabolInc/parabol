import PropTypes from 'prop-types';
import React from 'react';
import {Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import userDashReducer from 'universal/modules/userDashboard/ducks/userDashDuck';
import withReducer from '../../../../decorators/withReducer/withReducer';

const organizations = () => System.import('universal/modules/userDashboard/containers/Organizations/OrganizationsRoot');
const organization = () => System.import('universal/modules/userDashboard/containers/Organization/OrganizationRoot');
const userDashRoot = () => System.import('universal/modules/userDashboard/components/UserDashRoot');
const userSettings = () => System.import('universal/modules/userDashboard/containers/UserSettings/UserSettingsContainer');
const notificationsMod = () => System.import('universal/modules/notifications/containers/Notifications/NotificationsContainer');

const UserDashboard = (props) => {
  const {match, notifications, teams} = props;
  return (
    <Switch>
      <AsyncRoute exact path={match.url} mod={userDashRoot} extraProps={{teams}} />
      <AsyncRoute path={`${match.url}/settings`} mod={userSettings} />
      <AsyncRoute exact path={`${match.url}/organizations`} mod={organizations} />
      <AsyncRoute isAbstract path={`${match.url}/organizations/:orgId`} mod={organization} />
      <AsyncRoute path={`${match.url}/notifications`} mod={notificationsMod} extraProps={{notifications}} />
    </Switch>
  );
};

UserDashboard.propTypes = {
  match: PropTypes.object.isRequired,
  notifications: PropTypes.object,
  teams: PropTypes.array
};

export default withReducer({userDashboard: userDashReducer})(
  UserDashboard
);
