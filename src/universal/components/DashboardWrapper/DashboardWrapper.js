import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription';
import TaskSubscription from 'universal/subscriptions/TaskSubscription';
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription';
import TeamSubscription from 'universal/subscriptions/TeamSubscription';
import {cacheConfig} from 'universal/utils/constants';
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription';
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription';
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext as dragDropContext} from 'react-dnd';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';

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
  NotificationSubscription,
  TaskSubscription,
  TeamSubscription,
  TeamMemberSubscription,
  OrganizationSubscription
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
            <DashSidebar viewer={viewer} location={location} />
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

export default dragDropContext(HTML5Backend)(connect()(withRouter(withAtmosphere(DashboardWrapper))));
