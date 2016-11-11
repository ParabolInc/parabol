import React, {PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {DashSidebar} from 'universal/components/Dashboard';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const DashboardContainer = (props) => {
  const {children, location: {pathname}} = props;
  const [, dashType, dashChild] = pathname.split('/');
  const isUserSettings = dashType === 'me' && dashChild === 'settings';
  const title = dashType === 'me' ? 'My Dashboard' : 'Team Dashboard';
  return (
    <DashLayoutContainer title={title}>
      <DashSidebar isUserSettings={isUserSettings}/>
      {children}
    </DashLayoutContainer>
  );
};

DashboardContainer.propTypes = {
  children: PropTypes.any,
  location: PropTypes.object
};

export default
requireAuth(
  socketWithPresence(
    dragDropContext(HTML5Backend)(
      DashboardContainer
    )
  )
);
