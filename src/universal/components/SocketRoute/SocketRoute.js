import PropTypes from 'prop-types';
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Switch} from 'react-router-dom';
import {socketClusterReducer} from 'redux-socket-cluster';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import UserMemoSubscription from 'universal/subscriptions/UserMemoSubscription';
import {DEFAULT_TTL} from 'universal/utils/constants';
import withReducer from '../../decorators/withReducer/withReducer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const dashWrapper = () => System.import('universal/components/DashboardWrapper/DashboardWrapper');
const meetingContainer = () => System.import('universal/modules/meeting/containers/MeetingContainer/MeetingContainer');

const githubRepoQuery = graphql`
  query NotificationsQuery {
    viewer {
      notifications {
        edges {
          nodes {
            id
            orgId
            startAt
            type
            ... on NotifyFacilitatorRequest {
              requestorName
              requestorId
            }
            ... on NotifyAddedToTeam {
              _authToken {
                sub
              }
              teamName
            } 
          }
        }    
      }
    }
  }
`;

const subscriptions = [
  UserMemoSubscription
];

const cacheConfig = {ttl: DEFAULT_TTL};

const SocketRoute = ({atmosphere, jwt, teamMemberId}) => {
  const [, teamId] = teamMemberId.split('::');
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={githubRepoQuery}
      variables={{teamId, service: GITHUB}}
      subscriptions={subscriptions}
      render={({error, props}) => {
        const viewer = props ? props.viewer : undefined;
        return (
          <Switch>
            <AsyncRoute isAbstract path="(/me|/newteam|/team)" mod={dashWrapper} extraProps={{viewer}}/>
            <AsyncRoute path="/meeting/:teamId/:localPhase?/:localPhaseItem?" mod={meetingContainer}
                        extraProps={{viewer}}/>
          </Switch>
        );
      }}

    />
  );
};

// TODO wrap this in a QueryRenderer for Notifications
const SocketRoute = () => {


};

SocketRoute.propTypes = {
  match: PropTypes.object.isRequired
};

export default
withAtmosphere(
  withReducer({socket: socketClusterReducer})(
    dragDropContext(HTML5Backend)(
      socketWithPresence(
        SocketRoute
      )
    )
  )
);
