import PropTypes from 'prop-types';
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OrgBilling from 'universal/modules/userDashboard/components/OrgBilling/OrgBilling';
import {DEFAULT_TTL} from 'universal/utils/constants';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';

const query = graphql`
  query OrgBillingRootQuery($orgId: ID!, $first: Int!, $after: String) {
    viewer {
      ...OrgBilling_viewer
    }
  }
`;

const cacheConfig = {ttl: DEFAULT_TTL};

const OrgBillingRoot = ({atmosphere, orgId, org}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId, first: 1}}
      // subscriptions={subscriptions}
      render={({error, props: queryProps}) => {
        return (
          <TransitionGroup appear style={{overflow: 'hidden'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {queryProps && <AnimatedFade key="1">
              <OrgBilling viewer={queryProps.viewer} org={org} />
            </AnimatedFade>}
            {!queryProps && !error &&
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

OrgBillingRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  org: PropTypes.object,
  orgId: PropTypes.string.isRequired
};

export default withAtmosphere(OrgBillingRoot);
