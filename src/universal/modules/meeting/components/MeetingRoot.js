import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingContainer from 'universal/modules/meeting/containers/MeetingContainer/MeetingContainer';
import AgendaItemAddedSubscription from 'universal/subscriptions/AgendaItemAddedSubscription';
import AgendaItemRemovedSubscription from 'universal/subscriptions/AgendaItemRemovedSubscription';
import AgendaItemUpdatedSubscription from 'universal/subscriptions/AgendaItemUpdatedSubscription';
import MeetingUpdatedSubscription from 'universal/subscriptions/MeetingUpdatedSubscription';
import ProjectCreatedSubscription from 'universal/subscriptions/ProjectCreatedSubscription';
import ProjectDeletedSubscription from 'universal/subscriptions/ProjectDeletedSubscription';
import ProjectUpdatedSubscription from 'universal/subscriptions/ProjectUpdatedSubscription';
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription';
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription';
import NotificationsAddedSubscription from 'universal/subscriptions/NotificationsAddedSubscription';
import NotificationsClearedSubscription from 'universal/subscriptions/NotificationsClearedSubscription';

const query = graphql`
  query MeetingRootQuery($teamId: ID!) {
    viewer {
      ...MeetingContainer_viewer
    }
  }
`;

const subscriptions = [
  AgendaItemAddedSubscription,
  AgendaItemUpdatedSubscription,
  AgendaItemRemovedSubscription,
  MeetingUpdatedSubscription,
  ProjectUpdatedSubscription,
  ProjectCreatedSubscription,
  ProjectDeletedSubscription,
  TeamMemberSubscription,
  NewAuthTokenSubscription,
  NotificationsAddedSubscription,
  NotificationsClearedSubscription
];

const MeetingRoot = ({atmosphere, dispatch, history, location, match}) => {
  const {params: {localPhase, localPhaseItem, teamId}} = match;
  return (
    <QueryRenderer
      cacheConfig={{ttl: 30000}}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      subParams={{dispatch, history, location}}
      render={({error, props: renderProps}) => {
        const {userId} = atmosphere;
        const myTeamMemberId = `${userId}::${teamId}`;
        return (
          <TransitionGroup appear component={null}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
            <AnimatedFade key="1">
              <MeetingContainer
                localPhase={localPhase}
                localPhaseItem={localPhaseItem && Number(localPhaseItem)}
                teamId={teamId}
                myTeamMemberId={myTeamMemberId}
                userId={userId}
                viewer={renderProps.viewer}
              />
            </AnimatedFade>
            }
            {!renderProps && !error &&
            <AnimatedFade key="2" unmountOnExit exit={false}>
              <LoadingView />
            </AnimatedFade>
            }
          </TransitionGroup>
        );
      }}
    />
  );
};

MeetingRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default connect()(withRouter(withAtmosphere(MeetingRoot)));
