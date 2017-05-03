import PropTypes from 'prop-types';
import React from 'react';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import {Route} from 'react-router-dom';
import TeamBundle from 'universal/modules/teamDashboard/containers/Team/TeamBundle';
import UserBundle from 'universal/modules/userDashboard/components/UserDashboard/UserBundle';
import NewTeamBundle from '../../modules/newTeam/components/NewTeam/NewTeamBundle';

const DashboardWrapper = () => {
  return (
    <DashLayoutContainer>
      <DashSidebar />
      <Route path="/me" component={UserBundle} />
      <Route path="/team/:teamId" component={TeamBundle} />
      <Route path="/newteam/:newOrg?" component={NewTeamBundle} />
    </DashLayoutContainer>
  );
};

DashboardWrapper.propTypes = {
  title: PropTypes.string
};

export default DashboardWrapper;
