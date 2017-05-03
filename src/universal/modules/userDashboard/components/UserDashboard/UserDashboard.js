import PropTypes from 'prop-types';
import React from 'react';
import UserDashBundle from './UserDashBundle';
import {Route, Switch, withRouter} from 'react-router-dom';
import UserSettingsBundle from '../../containers/UserSettings/UserSettingsBundle';
import OrganizationsBundle from '../../containers/Organizations/OrganizationsBundle';
import OrganizationBundle from '../../containers/Organization/OrganizationBundle';
import NotificationsBundle from '../../../notifications/containers/Notifications/NotificationsBundle';

const UserDashboard = (props) => {
  const {match} = props;
  return (
    <Switch>
      <Route exact path={match.url} component={UserDashBundle} />
      <Route path={`${match.url}/settings`} component={UserSettingsBundle} />
      <Route exact path={`${match.url}/organizations`} component={OrganizationsBundle} />
      <Route path={`${match.url}/organizations/:orgId/:orgArea?`} component={OrganizationBundle} />
      <Route path={`${match.url}/notifications`} component={NotificationsBundle} />
    </Switch>
  );
};

UserDashboard.propTypes = {
  match: PropTypes.object.isRequired
};

export default withRouter(UserDashboard);
