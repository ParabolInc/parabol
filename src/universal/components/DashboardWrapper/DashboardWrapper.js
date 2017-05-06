import PropTypes from 'prop-types';
import React from 'react';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';

const DashboardWrapper = () => {
  return (
    <DashLayoutContainer>
      <DashSidebar />
      <AsyncRoute path="/me" mod={() => System.import('universal/modules/userDashboard/components/UserDashboard/UserDashboard')} />
      <AsyncRoute path="/team/:teamId" mod={() => System.import('universal/modules/teamDashboard/containers/Team/TeamContainer')} />
      <AsyncRoute path="/newteam/:newOrg?" mod={() => System.import('universal/modules/newTeam/containers/NewTeamForm/NewTeamFormContainer')} />
    </DashLayoutContainer>
  );
};

DashboardWrapper.propTypes = {
  title: PropTypes.string
};

export default DashboardWrapper;
