/* eslint-disable no-undef */
import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import Organization from 'universal/modules/userDashboard/components/Organization/Organization';
import {DEFAULT_TTL} from 'universal/utils/constants';

const query = graphql`
  query OrganizationRootQuery($orgId: ID!) {
    viewer {
      ...Organization_viewer
    }
  }
`;

// const subscriptions = [];

const cacheConfig = {ttl: DEFAULT_TTL};

const OrganizationRoot = (rootProps) => {
  const {
    atmosphere,
    match
  } = rootProps;
  const {params: {orgId}} = match;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId}}
      // subscriptions={subscriptions}
      render={({error, props: queryProps}) => {
        if (error) {
          return <ErrorComponent height={'14rem'} error={error} />;
        }
        const viewer = queryProps ? queryProps.viewer : null;
        // pass in match to mitigate update blocker
        return <Organization orgId={orgId} viewer={viewer} match={match} />;
      }}
    />
  );
};

OrganizationRoot.propTypes = {
  activeOrgDetail: PropTypes.string,
  billingLeaders: PropTypes.array,
  dispatch: PropTypes.func,
  myUserId: PropTypes.string,
  org: PropTypes.object
};

export default withAtmosphere(OrganizationRoot);
