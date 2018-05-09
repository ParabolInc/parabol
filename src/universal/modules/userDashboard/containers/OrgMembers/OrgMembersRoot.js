import PropTypes from 'prop-types';
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OrgMembers from 'universal/modules/userDashboard/components/OrgMembers/OrgMembers';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';

const query = graphql`
  query OrgMembersRootQuery($orgId: ID!, $first: Int!, $after: String) {
    viewer {
      ...OrgMembers_viewer
    }
  }
`;

const OrgMembersRoot = ({atmosphere, orgId}) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{orgId, first: 10000}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<OrgMembers />}
        />
      )}
    />
  );
};

OrgMembersRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired
};

export default withAtmosphere(OrgMembersRoot);
