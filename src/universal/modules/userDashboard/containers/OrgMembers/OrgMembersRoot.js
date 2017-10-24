import PropTypes from 'prop-types';
import React from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OrgMembers from 'universal/modules/userDashboard/components/OrgMembers/OrgMembers';

const query = graphql`
  query OrgMembersRootQuery($orgId: ID!, $first: Int!, $after: String) {
    viewer {
      ...OrgMembers_viewer
    }
  }
`;

const OrgMembersRoot = ({atmosphere, orgId, org}) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{orgId, first: 10000}}
      render={({error, props: queryProps}) => {
        return (
          <TransitionGroup appear style={{overflow: 'hidden'}}>
            {error && <ErrorComponent height={'14rem'} error={error} />}
            {queryProps && <AnimatedFade key="1">
              <OrgMembers viewer={queryProps.viewer} orgId={orgId} org={org} />
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

OrgMembersRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  org: PropTypes.object,
  orgId: PropTypes.string.isRequired
};

export default withAtmosphere(OrgMembersRoot);
