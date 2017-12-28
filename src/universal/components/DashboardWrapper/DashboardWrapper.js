import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import TeamAddedSubscription from 'universal/subscriptions/TeamAddedSubscription';
import TeamMemberAddedSubscription from 'universal/subscriptions/TeamMemberAddedSubscription';
import TeamMemberUpdatedSubscription from 'universal/subscriptions/TeamMemberUpdatedSubscription';
import TeamUpdatedSubscription from 'universal/subscriptions/TeamUpdatedSubscription';
import {cacheConfig} from 'universal/utils/constants';
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription';
import NotificationsAddedSubscription from 'universal/subscriptions/NotificationsAddedSubscription';
import NotificationsClearedSubscription from 'universal/subscriptions/NotificationsClearedSubscription';

const query = graphql`
  query DashboardWrapperQuery {
    viewer {
      notifications(first: 100) @connection(key: "DashboardWrapper_notifications") {
        edges {
          node {
            id
            orgId
            startAt
            type
            ...NotificationRow_notification
          }
        }
      }
      ...DashSidebar_viewer
      ...DashLayoutContainer_viewer
    }
  }
`;

const userDashboard = () => System.import('universal/modules/userDashboard/components/UserDashboard/UserDashboard');
const teamRoot = () => System.import('universal/modules/teamDashboard/components/TeamRoot');
const newTeam = () => System.import('universal/modules/newTeam/containers/NewTeamForm/NewTeamRoot');

const subscriptions = [
  NewAuthTokenSubscription,
  NotificationsAddedSubscription,
  NotificationsClearedSubscription,
  TeamAddedSubscription,
  TeamUpdatedSubscription,
  TeamMemberAddedSubscription,
  TeamMemberUpdatedSubscription
];

const DashboardWrapper = ({atmosphere, dispatch, history, location}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      subParams={{dispatch, history, location}}
      subscriptions={subscriptions}
      render={({props: renderProps}) => {
        const notifications = (renderProps && renderProps.viewer) ?
          renderProps.viewer.notifications : undefined;
        const viewer = renderProps ? renderProps.viewer : null;
        return (
          <DashLayoutContainer viewer={viewer}>
            <DashSidebar viewer={viewer} />
            <AsyncRoute isAbstract path="/me" mod={userDashboard} extraProps={{notifications}} />
            <AsyncRoute isAbstract path="/team/:teamId" mod={teamRoot} extraProps={{notifications}} />
            <AsyncRoute path="/newteam/:defaultOrgId?" mod={newTeam} extraProps={{notifications}} />
          </DashLayoutContainer>
        );
      }}

    />
  );
};

DashboardWrapper.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  notifications: PropTypes.object
};

export default connect()(withRouter(withAtmosphere(DashboardWrapper)));
