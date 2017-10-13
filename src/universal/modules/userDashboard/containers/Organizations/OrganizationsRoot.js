import PropTypes from 'prop-types';
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import Organizations from 'universal/modules/userDashboard/components/Organizations/Organizations';
import {DEFAULT_TTL} from 'universal/utils/constants';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OrganizationAddedSubscription from 'universal/subscriptions/OrganizationAddedSubscription';
import OrganizationUpdatedSubscription from 'universal/subscriptions/OrganizationUpdatedSubscription';

const query = graphql`
  query OrganizationsRootQuery {
    viewer {
      ...Organizations_viewer
    }
  }
`;

const subscriptions = [
  OrganizationAddedSubscription,
  OrganizationUpdatedSubscription
  // PAUSE/UNAPUSE user,
];

const cacheConfig = {ttl: DEFAULT_TTL};

const OrganizationsRoot = (props) => {
  const {
    atmosphere,
    history
  } = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      subscriptions={subscriptions}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear style={{overflow: 'hidden'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
            <AnimatedFade key="1">
              <Organizations viewer={renderProps.viewer} history={history} />
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

OrganizationsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withAtmosphere(OrganizationsRoot);
