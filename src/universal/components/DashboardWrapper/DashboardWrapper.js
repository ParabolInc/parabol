import PropTypes from 'prop-types';
import React from 'react';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
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
            ... on NotifyAddedToTeam {
              teamName
              teamId
            }
            ... on NotifyDenial {
              reason
              deniedByName
              inviteeEmail
            }
            ... on NotifyInvitation {
              inviterName
              inviteeEmail
              teamId
              teamName
            }
            ... on NotifyKickedOut {
              teamName
              teamId
            }
            ... on NotifyPayment {
              last4
              brand
            }
            ... on NotifyPromotion {
              groupName
            }
            ... on NotifyTeamArchived {
              teamName
            }
            ... on NotifyProjectInvolves {
              involvement
              team {
                id
                name
              }
              changeAuthor {
                preferredName
              }
              project {
                id
                content
                status
                tags
              }
            }
          }
        }
      }
    }
  }
`;

const userDashboard = () => System.import('universal/modules/userDashboard/components/UserDashboard/UserDashboard');
const teamContainer = () => System.import('universal/modules/teamDashboard/containers/Team/TeamContainer');
const newTeam = () => System.import('universal/modules/newTeam/containers/NewTeamForm/NewTeamRoot');

const subscriptions = [
  NewAuthTokenSubscription,
  NotificationsAddedSubscription,
  NotificationsClearedSubscription
];

const DashboardWrapper = ({atmosphere}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      subscriptions={subscriptions}
      render={({props: renderProps}) => {
        const notifications = (renderProps && renderProps.viewer) ?
          renderProps.viewer.notifications : undefined;
        const notificationsCount = notifications && notifications.edges ? notifications.edges.length : 0;
        return (
          <DashLayoutContainer notifications={notifications}>
            <DashSidebar notificationsCount={notificationsCount} />
            <AsyncRoute isAbstract path="/me" mod={userDashboard} extraProps={{notifications}} />
            <AsyncRoute isAbstract path="/team/:teamId" mod={teamContainer} extraProps={{notifications}} />
            <AsyncRoute path="/newteam/:defaultOrgId?" mod={newTeam} extraProps={{notifications}} />
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
