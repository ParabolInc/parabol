import ms from 'ms';
/* eslint-disable no-undef */
import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UserDashMain from 'universal/modules/userDashboard/components/UserDashMain/UserDashMain';
import ProjectUpdatedSubscription from 'universal/subscriptions/ProjectUpdatedSubscription';
import ProjectCreatedSubscription from 'universal/subscriptions/ProjectCreatedSubscription';

// short ttl for projects to avoid sending duplicates when switching from team to user dash
const cacheConfig = {ttl: ms('30s')};

const query = graphql`
  query UserDashRootQuery {
    viewer {
      ...UserDashMain_viewer
    }
  }
`;

const subscriptions = [
  ProjectUpdatedSubscription,
  ProjectCreatedSubscription,
];

const UserDashRoot = ({atmosphere, teams}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      subscriptions={subscriptions}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear style={{display: 'flex', width: '100%'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
            <AnimatedFade key="1">
              <UserDashMain viewer={renderProps.viewer} teams={teams} />
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

UserDashRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  teams: PropTypes.array
};

export default withAtmosphere(UserDashRoot);
