import PropTypes from 'prop-types';
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import {Switch} from 'react-router-dom';
import {socketClusterReducer} from 'redux-socket-cluster';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import NotificationsAddedSubscription from 'universal/subscriptions/NotificationsAddedSubscription';
import NotificationsClearedSubscription from 'universal/subscriptions/NotificationsClearedSubscription';
import {DEFAULT_TTL} from 'universal/utils/constants';
import withReducer from '../../decorators/withReducer/withReducer';
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription';

const dashWrapper = () => System.import('universal/components/DashboardWrapper/DashboardWrapper');
const meetingContainer = () => System.import('universal/modules/meeting/containers/MeetingContainer/MeetingContainer');

const query = graphql`
  query SocketRouteQuery {
    viewer {
      notifications(first: 100) @connection(key: "SocketRoute_notifications") {
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
          }
        }
      }
    }
  }
`;

const subscriptions = [
  NewAuthTokenSubscription,
  NotificationsAddedSubscription,
  NotificationsClearedSubscription
];

const cacheConfig = {ttl: DEFAULT_TTL};

const SocketRoute = ({atmosphere, dispatch, history, location}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      subscriptions={subscriptions}
      subParams={{dispatch, history, location}}
      render={({props: renderProps}) => {
        const notifications = renderProps ? renderProps.viewer.notifications : undefined;
        return (
          <Switch>
            <AsyncRoute isAbstract path="(/me|/newteam|/team)" mod={dashWrapper} extraProps={{notifications}} />
            <AsyncRoute
              path="/meeting/:teamId/:localPhase?/:localPhaseItem?"
              mod={meetingContainer}
              extraProps={{notifications}}
            />
          </Switch>
        );
      }}

    />
  );
};

SocketRoute.propTypes = {
  match: PropTypes.object.isRequired,
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired

};

export default
connect()(
  withAtmosphere(
    withReducer({socket: socketClusterReducer})(
      dragDropContext(HTML5Backend)(
        socketWithPresence(
          SocketRoute
        )
      )
    )
  )
);
