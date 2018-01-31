import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {graphql, QueryRenderer} from 'react-relay';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamIntegrations from 'universal/modules/teamDashboard/components/TeamIntegrations/TeamIntegrations';
import GitHubRepoAddedSubscription from 'universal/subscriptions/GitHubRepoAddedSubscription';
import GitHubRepoRemovedSubscription from 'universal/subscriptions/GitHubRepoRemovedSubscription';
import IntegrationLeftSubscription from 'universal/subscriptions/IntegrationLeftSubscription';
import ProviderAddedSubscription from 'universal/subscriptions/ProviderAddedSubscription';
import ProviderRemovedSubscription from 'universal/subscriptions/ProviderRemovedSubscription';
import SlackChannelAddedSubscription from 'universal/subscriptions/SlackChannelAddedSubscription';
import SlackChannelRemovedSubscription from 'universal/subscriptions/SlackChannelRemovedSubscription';
import {DEFAULT_TTL, GITHUB} from 'universal/utils/constants';
import GitHubMemberRemovedSubscription from 'universal/subscriptions/GitHubMemberRemovedSubscription';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

const teamIntegrationsQuery = graphql`
  query TeamIntegrationsRootQuery($teamId: ID!) {
    viewer {
      ...ProviderList_viewer
    }
  }
`;

const mapStateToProps = (state) => {
  return {
    jwt: state.auth.token
  };
};

const subscriptions = [
  ProviderRemovedSubscription,
  ProviderAddedSubscription,
  GitHubMemberRemovedSubscription,
  GitHubRepoAddedSubscription,
  GitHubRepoRemovedSubscription,
  SlackChannelAddedSubscription,
  SlackChannelRemovedSubscription,
  // if they're the last ones to leave, it'll remove the repo
  IntegrationLeftSubscription(GITHUB)
];

const cacheConfig = {ttl: DEFAULT_TTL};

const TeamIntegrationsRoot = ({jwt, atmosphere, teamMemberId}) => {
  const {teamId} = fromTeamMemberId(teamMemberId);
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={teamIntegrationsQuery}
      variables={{teamId}}
      subscriptions={subscriptions}
      render={({error, props}) => {
        if (error) {
          return <ErrorComponent height={'14rem'} error={error} />;
        }
        if (props) {
          return <TeamIntegrations viewer={props.viewer} jwt={jwt} teamId={teamId} />;
        }
        return <LoadingComponent height={'14rem'} />;
      }}

    />
  );
};


TeamIntegrationsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  jwt: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired,
  viewer: PropTypes.object
};

export default withAtmosphere(connect(mapStateToProps)(TeamIntegrationsRoot));
