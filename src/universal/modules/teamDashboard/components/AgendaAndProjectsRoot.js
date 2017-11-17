import React from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import AgendaAndProjects from 'universal/modules/teamDashboard/components/AgendaAndProjects/AgendaAndProjects';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import ProjectUpdatedSubscription from 'universal/subscriptions/ProjectUpdatedSubscription';
import ProjectCreatedSubscription from 'universal/subscriptions/ProjectCreatedSubscription';
import ProjectDeletedSubscription from 'universal/subscriptions/ProjectDeletedSubscription';
import ms from 'ms';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const query = graphql`
  query AgendaAndProjectsRootQuery($teamId: ID!) {
    viewer {
      ...AgendaAndProjects_viewer
    }
  }
`;

const subscriptions = [
  ProjectUpdatedSubscription,
  ProjectCreatedSubscription,
  ProjectDeletedSubscription
];
const cacheConfig = {ttl: ms('30s')};

const AgendaAndProjectsRoot = (props) => {
  const {atmosphere, match: {params: {teamId}}} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      render={({error, props: renderProps, loading}) => {
        if (!renderProps && !loading) {
          return null;
        }

        return (
          <TransitionGroup appear style={{display: 'flex', width: '100%', flex: 1}} exit={false}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
              <AnimatedFade key="1">
                <AgendaAndProjects
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

AgendaAndProjectsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  teams: PropTypes.array
};

export default withRouter(withAtmosphere(AgendaAndProjectsRoot));
