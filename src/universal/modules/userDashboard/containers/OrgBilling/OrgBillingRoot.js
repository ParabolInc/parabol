import PropTypes from 'prop-types';
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OrgBilling from 'universal/modules/userDashboard/components/OrgBilling/OrgBilling';
import {DEFAULT_TTL} from 'universal/utils/constants';

const query = graphql`
  query OrgBillingRootQuery($orgId: ID!, $first: Int!, $after: String) {
    viewer {
      ...OrgBilling_viewer
    }
  }
`;

const cacheConfig = {ttl: DEFAULT_TTL};

const OrgBillingRoot = (props) => {
  const {atmosphere, orgId, org} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId, first: 1}}
      // subscriptions={subscriptions}
      render={({error, renderProps}) => {
        if (error) {
          return <ErrorComponent height={'14rem'} error={error}/>;
        }
        const viewer = renderProps ? renderProps.viewer : null;
        return <OrgBilling viewer={viewer} org={org}/>;
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
