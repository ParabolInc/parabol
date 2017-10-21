import PropTypes from 'prop-types';
import React from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamArchive from 'universal/modules/teamDashboard/components/TeamArchive/TeamArchive';
import ProjectUpdatedSubscription from 'universal/subscriptions/ProjectUpdatedSubscription';


const query = graphql`
  query TeamArchiveRootQuery($teamId: ID!, $first: Int!, $after: DateTime) {
    viewer {
      ...TeamArchive_viewer
    }
  }
`;

const subscriptions = [
  ProjectUpdatedSubscription
];

const TeamArchiveRoot = ({atmosphere, match, team}) => {
  const {params: {teamId}} = match;
  const {userId} = atmosphere;
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, first: 40}}
      subscriptions={subscriptions}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear style={{overflow: 'hidden'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
            <AnimatedFade key="1">
              <TeamArchive
                teamId={teamId}
                team={team}
                userId={userId}
                viewer={renderProps.viewer}
              />
            </AnimatedFade>
            }
            {!renderProps && !error &&
            <AnimatedFade key="2" unmountOnExit exit={false}>
              <LoadingComponent height={'5rem'} />
            </AnimatedFade>
            }
          </TransitionGroup>
        );
      }}
    />
  );
};

TeamArchiveRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  team: PropTypes.shape({
    orgId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    tier: PropTypes.string.isRequired
  })
};

export default withAtmosphere(TeamArchiveRoot);
