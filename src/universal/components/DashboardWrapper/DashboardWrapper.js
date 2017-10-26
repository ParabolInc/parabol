import PropTypes from 'prop-types';
import React from 'react';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';

const userDashboard = () => System.import('universal/modules/userDashboard/components/UserDashboard/UserDashboard');
const teamContainer = () => System.import('universal/modules/teamDashboard/containers/Team/TeamContainer');
const newTeam = () => System.import('universal/modules/newTeam/containers/NewTeamForm/NewTeamRoot');

const DashboardWrapper = (props) => {
  const {notifications} = props;
  const notificationsCount = notifications ? notifications.edges.length : 0;
  return (
    <DashLayoutContainer notifications={notifications}>
      <DashSidebar notificationsCount={notificationsCount} />
      <AsyncRoute isAbstract path="/me" mod={userDashboard} extraProps={{notifications}} />
      <AsyncRoute isAbstract path="/team/:teamId" mod={teamContainer} extraProps={{notifications}} />
      <AsyncRoute path="/newteam/:defaultOrgId?" mod={newTeam} extraProps={{notifications}} />
    </DashLayoutContainer>
  );
};

DashboardWrapper.propTypes = {
  notifications: PropTypes.object
};

export default DashboardWrapper;
