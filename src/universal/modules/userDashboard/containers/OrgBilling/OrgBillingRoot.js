import PropTypes from 'prop-types';
import React from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OrgBilling from 'universal/modules/userDashboard/components/OrgBilling/OrgBilling';

const query = graphql`
  query OrgBillingRootQuery($orgId: ID!, $first: Int!, $after: DateTime) {
    viewer {
      ...OrgBilling_viewer
    }
  }
`;

const OrgBillingRoot = ({atmosphere, orgId, org}) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{orgId, first: 3}}
      render={({error, props: renderProps}) => {
        return (
          <TransitionGroup appear style={{overflow: 'hidden'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {renderProps &&
              <AnimatedFade key="1">
                <OrgBilling viewer={renderProps.viewer} org={org} />
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

OrgBillingRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  org: PropTypes.object,
  orgId: PropTypes.string.isRequired
};

export default withAtmosphere(OrgBillingRoot);
