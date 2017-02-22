import React, {PropTypes} from 'react';
import DashboardWrapper from 'universal/components/DashboardWrapper/DashboardWrapper';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const UserDashboard = (props) => {
  const {children, location: {pathname}} = props;
  const title = pathname === '/me' ? 'User Dashboard' : 'User Settings';
  return (
    <DashboardWrapper location={pathname} title={title}>
      {children}
    </DashboardWrapper>
  );
};

UserDashboard.propTypes = {
  children: PropTypes.any,
  location: PropTypes.object
};

export default
dragDropContext(HTML5Backend)(
  socketWithPresence(
    UserDashboard
  )
);
