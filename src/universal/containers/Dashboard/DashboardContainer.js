import React, {PropTypes} from 'react';
import {DashSidebar} from 'universal/components/Dashboard';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TeamDashboard from 'universal/modules/teamDashboard/containers/Team/TeamContainer';
import UserDashboard from 'universal/modules/userDashboard/components/UserDashboard/UserDashboard';
import Helmet from 'react-helmet';

const DashboardContainer = (props) => {
  const {children, location: {pathname}, params} = props;
  const [, dashType, dashChild] = pathname.split('/');
  const isMe = dashType === 'me';
  const title = isMe ? 'My Dashboard' : 'Team Dashboard';
  const isUserSettings = isMe && dashChild === 'settings';
  const Dashboard = isMe ? UserDashboard : TeamDashboard;
  return (
    <DashLayoutContainer>
      <Helmet title={title}/>
      <DashSidebar isUserSettings={isUserSettings}/>
      <Dashboard children={children} params={params}/>
    </DashLayoutContainer>
  );
};

DashboardContainer.propTypes = {
  children: PropTypes.any,
  location: PropTypes.object
};

export default
dragDropContext(HTML5Backend)(
  socketWithPresence(
    DashboardContainer
  )
);
