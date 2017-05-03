import PropTypes from 'prop-types';
import React from 'react';
import DashboardWrapper from 'universal/components/DashboardWrapper/DashboardWrapper';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import UserDashBundle from "./UserDashBundle";
import {Route, Switch, withRouter} from 'react-router-dom';
import UserSettingsBundle from "../../containers/UserSettings/UserSettingsBundle";
import OrganizationsBundle from "../../containers/Organizations/OrganizationsBundle";
import OrganizationBundle from "../../containers/Organization/OrganizationBundle";
import NotificationsBundle from "../../../notifications/containers/Notifications/NotificationsBundle";

const UserDashboard = (props) => {
  const {location: {pathname}, match} = props;
  const title = pathname === '/me' ? 'My Dashboard | Parabol' : 'My Settings | Parabol';
  console.log('match', match.url)
  return (
    <DashboardWrapper location={pathname} title={title}>
      <Switch>
        <Route exact path={match.url} component={UserDashBundle}/>
        <Route path={`${match.url}/settings`} component={UserSettingsBundle}/>
        <Route exact path={`${match.url}/organizations`} component={OrganizationsBundle}/>
        <Route path={`${match.url}/organizations/:orgId/:orgArea?`} component={OrganizationBundle}/>
        <Route path={`${match.url}/notifications`} component={NotificationsBundle}/>
      </Switch>
    </DashboardWrapper>
  );
};

UserDashboard.propTypes = {
  children: PropTypes.any,
  location: PropTypes.object
};

export default withRouter(
  dragDropContext(HTML5Backend)(
    socketWithPresence(
      UserDashboard
    )
  )
);
