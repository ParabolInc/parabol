import ms from 'ms';
/* eslint-disable no-undef */
import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UserDashMain from 'universal/modules/userDashboard/components/UserDashMain/UserDashMain';
import ProjectCreatedSubscription from 'universal/subscriptions/ProjectCreatedSubscription';
import ProjectDeletedSubscription from 'universal/subscriptions/ProjectDeletedSubscription';
import ProjectUpdatedSubscription from 'universal/subscriptions/ProjectUpdatedSubscription';

// short ttl for projects to avoid sending duplicates when switching from team to user dash
const cacheConfig = {ttl: ms('10s')};

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
  ProjectDeletedSubscription
];

const UserDashRoot = ({atmosphere}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      subscriptions={subscriptions}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear component={null}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
            <AnimatedFade key="1">
              <UserDashMain viewer={renderProps.viewer} />
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

UserDashRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired
};

export default withAtmosphere(UserDashRoot);
