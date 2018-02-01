import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import {Switch} from 'react-router-dom';
import {socketClusterReducer} from 'redux-socket-cluster';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withReducer from '../../decorators/withReducer/withReducer';

const dashWrapper = () => System.import('universal/components/DashboardWrapper/DashboardWrapper');
const meetingRoot = () => System.import('universal/modules/meeting/components/MeetingRoot');

const SocketRoute = () => {
  return (
    <Switch>
      <AsyncRoute
        isAbstract
        path="(/me|/newteam|/team)"
        mod={dashWrapper}
      />
      <AsyncRoute
        path="/meeting/:teamId/:localPhase?/:localPhaseItem?"
        mod={meetingRoot}
      />
    </Switch>
  );
};

export default connect()(
  withAtmosphere(
    withReducer({socket: socketClusterReducer})(
      dragDropContext(HTML5Backend)(
        SocketRoute
      )
    )
  )
);
