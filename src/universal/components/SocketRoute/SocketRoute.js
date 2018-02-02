import React, {Component} from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import {Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const dashWrapper = () => System.import('universal/components/DashboardWrapper/DashboardWrapper');
const meetingRoot = () => System.import('universal/modules/meeting/components/MeetingRoot');

// eslint-disable-next-line react/prefer-stateless-function
class SocketRoute extends Component {
  render() {
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
  }
}

export default connect()(
  withAtmosphere(
    dragDropContext(HTML5Backend)(
      SocketRoute
    )
  )
);
