import PropTypes from 'prop-types';
import React from 'react';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Route, Switch} from 'react-router-dom';
import MeetingBundle from '../../modules/meeting/containers/MeetingContainer/MeetingBundle';
import DashboardWrapperBundle from '../DashboardWrapper/DashboardWrapperBundle';

const PrivateRoute = () => {
  return (
    <Switch>
      <Route path="(/me|/newteam|/team)" component={DashboardWrapperBundle} />
      <Route path="/meeting/:teamId/:localPhase?/:localPhaseItem?" component={MeetingBundle} />
    </Switch>
  );
};

PrivateRoute.propTypes = {
  match: PropTypes.object.isRequired
};

export default
dragDropContext(HTML5Backend)(
  socketWithPresence(
    PrivateRoute
  )
);
