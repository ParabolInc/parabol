import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import GitHubIntegrations from 'universal/modules/teamDashboard/components/GitHubIntegrations/GitHubIntegrations';
import {DEFAULT_TTL, GITHUB} from 'universal/utils/constants';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import {connect} from 'react-redux';
import GitHubRepoAddedSubscription from 'universal/subscriptions/GitHubRepoAddedSubscription';
import GitHubRepoRemovedSubscription from 'universal/subscriptions/GitHubRepoRemovedSubscription';
import ProviderRemovedSubscription from 'universal/subscriptions/ProviderRemovedSubscription';
import ProviderAddedSubscription from 'universal/subscriptions/ProviderAddedSubscription';
import IntegrationJoinedSubscription from 'universal/subscriptions/IntegrationJoinedSubscription';
import IntegrationLeftSubscription from 'universal/subscriptions/IntegrationLeftSubscription';

const githubRepoQuery = graphql`
  query GitHubIntegrationsRootQuery($teamId: ID!, $service: IntegrationService!) {
    viewer {
      ...GitHubIntegrations_viewer
    }
  }
`;

const mapStateToProps = (state) => {
  return {
    jwt: state.auth.token
  };
};

const subscriptions = [
  GitHubRepoAddedSubscription,
  GitHubRepoRemovedSubscription,
  ProviderRemovedSubscription,
  ProviderAddedSubscription,
  IntegrationJoinedSubscription(GITHUB),
  IntegrationLeftSubscription(GITHUB)
];

const cacheConfig = {ttl: DEFAULT_TTL};

const GitHubIntegrationsRoot = ({atmosphere, jwt, teamMemberId}) => {
  const [, teamId] = teamMemberId.split('::');
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={githubRepoQuery}
      variables={{teamId, service: GITHUB}}
      subscriptions={subscriptions}
      render={({error, props}) => {
        if (error) {
          return <ErrorComponent height={'14rem'} error={error} />;
        } else if (props) {
          const {viewer} = props;
          return (<GitHubIntegrations
            jwt={jwt}
            viewer={viewer}
            teamId={teamId}
          />);
        }
        return <LoadingComponent height={'14rem'} />;
      }}

    />
  );
};


GitHubIntegrationsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  jwt: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired,
  viewer: PropTypes.object
};

export default withAtmosphere(connect(mapStateToProps)(GitHubIntegrationsRoot));
