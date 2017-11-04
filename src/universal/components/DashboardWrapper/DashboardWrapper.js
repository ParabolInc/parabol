import PropTypes from 'prop-types';
import React from 'react';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import {cacheConfig} from 'universal/utils/constants';

const query = graphql`
  query DashboardWrapperQuery {
    viewer {
      teams {
        id
        name
      }
    }
  }
`;

const userDashboard = () => System.import('universal/modules/userDashboard/components/UserDashboard/UserDashboard');
const teamContainer = () => System.import('universal/modules/teamDashboard/containers/Team/TeamContainer');
const newTeam = () => System.import('universal/modules/newTeam/containers/NewTeamForm/NewTeamRoot');

// const subscriptions = [];
const DashboardWrapper = ({atmosphere, notifications}) => {
  const notificationsCount = notifications ? notifications.edges.length : 0;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      // subscriptions={subscriptions}
      render={({props: renderProps}) => {
        const teams = (renderProps && renderProps.viewer)
          ? renderProps.viewer.teams
          : undefined;
        return (
          <DashLayoutContainer notifications={notifications}>
            <DashSidebar notificationsCount={notificationsCount} />
            <AsyncRoute isAbstract path="/me" mod={userDashboard} extraProps={{notifications, teams}} />
            <AsyncRoute isAbstract path="/team/:teamId" mod={teamContainer} extraProps={{notifications, teams}} />
            <AsyncRoute path="/newteam/:defaultOrgId?" mod={newTeam} extraProps={{notifications, teams}} />
          </DashLayoutContainer>
        );
      }}

    />
  );
};

DashboardWrapper.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  notifications: PropTypes.object
};

export default withAtmosphere(DashboardWrapper);
