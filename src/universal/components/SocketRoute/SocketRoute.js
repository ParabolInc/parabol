import PropTypes from 'prop-types';
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Switch} from 'react-router-dom';
import {socketClusterReducer} from 'redux-socket-cluster';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import withReducer from '../../decorators/withReducer/withReducer';
import withAsync from 'react-async-hoc';

const PrivateRoute = () => {
  return (
    <Switch>
      <AsyncRoute
        path="(/me|/newteam|/team)"
        mod={() => System.import('universal/components/DashboardWrapper/DashboardWrapper')}
      />
      <AsyncRoute
        path="/meeting/:teamId/:localPhase?/:localPhaseItem?"
        mod={() => System.import('universal/modules/meeting/containers/MeetingContainer/MeetingContainer')}
      />
    </Switch>
  );
};

PrivateRoute.propTypes = {
  match: PropTypes.object.isRequired
};

const fetchStyles = {
  '/static/css/Draft.css': () => ({stylesLoaded: true})
};

export default
withAsync(undefined, fetchStyles)(
  withReducer({socket: socketClusterReducer})(
    dragDropContext(HTML5Backend)(
      socketWithPresence(
        PrivateRoute
      )
    )
  )
);
