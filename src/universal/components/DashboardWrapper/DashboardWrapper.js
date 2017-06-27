import PropTypes from 'prop-types';
import React from 'react';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';

const userDashboard = () => System.import('universal/modules/userDashboard/components/UserDashboard/UserDashboard');
const teamContainer = () => System.import('universal/modules/teamDashboard/containers/Team/TeamContainer');
const newTeam = () => System.import('universal/modules/newTeam/containers/NewTeamForm/NewTeamFormContainer');

const DashboardWrapper = () => {
  return (
    <DashLayoutContainer>
      <DashSidebar />
      <AsyncRoute isAbstract path="/me" mod={userDashboard} />
      <AsyncRoute isAbstract path="/team/:teamId" mod={teamContainer} />
      <AsyncRoute path="/newteam/:newOrg?" mod={newTeam} />
    </DashLayoutContainer>
  );
};

DashboardWrapper.propTypes = {
  title: PropTypes.string
};

export default DashboardWrapper;
