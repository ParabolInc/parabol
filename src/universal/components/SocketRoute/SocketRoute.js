import PropTypes from 'prop-types';
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Switch} from 'react-router-dom';
import {socketClusterReducer} from 'redux-socket-cluster';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import withReducer from '../../decorators/withReducer/withReducer';


const dashWrapper = () => System.import('universal/components/DashboardWrapper/DashboardWrapper');
const meetingContainer = () => System.import('universal/modules/meeting/containers/MeetingContainer/MeetingContainer');

const SocketRoute = () => {
  return (
    <Switch>
      <AsyncRoute path="(/me|/newteam|/team)" mod={dashWrapper} />
      <AsyncRoute bottom path="/meeting/:teamId/:localPhase?/:localPhaseItem?" mod={meetingContainer} />
    </Switch>
  );
};

SocketRoute.propTypes = {
  match: PropTypes.object.isRequired
};

export default
withReducer({socket: socketClusterReducer})(
  dragDropContext(HTML5Backend)(
    socketWithPresence(
      SocketRoute
    )
  )
);
