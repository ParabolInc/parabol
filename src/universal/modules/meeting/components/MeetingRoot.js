import PropTypes from 'prop-types';
import React from 'react';
import MeetingContainer from 'universal/modules/meeting/containers/MeetingContainer/MeetingContainer';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import {TransitionGroup} from 'react-transition-group';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import AnimatedFade from 'universal/components/AnimatedFade';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingUpdatedSubscription from 'universal/subscriptions/MeetingUpdatedSubscription';
import TeamMemberUpdatedSubscription from 'universal/subscriptions/TeamMemberUpdatedSubscription';
import ProjectUpdatedSubscription from 'universal/subscriptions/ProjectUpdatedSubscription';
import ProjectCreatedSubscription from 'universal/subscriptions/ProjectCreatedSubscription';
import ProjectDeletedSubscription from 'universal/subscriptions/ProjectDeletedSubscription';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const query = graphql`
  query MeetingRootQuery($teamId: ID!) {
    viewer {
      ...MeetingContainer_viewer
    }
  }
`;

const subscriptions = [
  MeetingUpdatedSubscription,
  ProjectUpdatedSubscription,
  ProjectCreatedSubscription,
  ProjectDeletedSubscription,
  TeamMemberUpdatedSubscription
];

const MeetingRoot = ({atmosphere, match}) => {
  const {params: {localPhase, localPhaseItem, teamId}} = match;
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
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
              <LoadingView/>
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
  match: PropTypes.object.isRequired
};

export default withAtmosphere(MeetingRoot);
