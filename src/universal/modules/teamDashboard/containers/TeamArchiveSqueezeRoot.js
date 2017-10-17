import PropTypes from 'prop-types';
import React from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamArchiveSqueeze from 'universal/modules/teamDashboard/components/TeamArchiveSqueeze/TeamArchiveSqueeze';
import ui from 'universal/styles/ui';


const query = graphql`
  query TeamArchiveSqueezeRootQuery($teamId: ID!) {
    viewer {
      ...TeamArchiveSqueeze_viewer
    }
  }
`;

const TeamArchiveSqueezeRoot = ({atmosphere, orgId, projectsAvailableCount, teamId}) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, first: 40}}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear style={{overflow: 'hidden'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
            <AnimatedFade key="1">
              <TeamArchiveSqueeze
                orgId={orgId}
                projectsAvailableCount={projectsAvailableCount}
                teamId={teamId}
                viewer={renderProps.viewer}
              />
            </AnimatedFade>
            }
            {!renderProps && !error &&
            <AnimatedFade key="2" unmountOnExit exit={false}>
              <LoadingComponent height={'5rem'} width={ui.projectColumnsMaxWidth} />
            </AnimatedFade>
            }
          </TransitionGroup>
        );
      }}
    />
  );
};

TeamArchiveSqueezeRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  isBillingLeader: PropTypes.bool,
  orgId: PropTypes.string.isRequired,
  projectsAvailableCount: PropTypes.number.isRequired,
  teamId: PropTypes.string.isRequired
};

export default withAtmosphere(TeamArchiveSqueezeRoot);
