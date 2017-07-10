import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import SlackIntegrations from 'universal/modules/teamDashboard/components/SlackIntegrations/SlackIntegrations';
import {SLACK} from 'universal/utils/constants';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';

const slackChannelQuery = graphql`
  query SlackIntegrationsRootQuery($teamId: ID!, $teamMemberId: ID!, $service: ID!) {
    viewer {
      ...SlackIntegrations_viewer
    }
  }
`;

const SlackIntegrationsRoot = ({atmosphere, teamMemberId}) => {
  const [, teamId] = teamMemberId.split('::');
  const cacheConfig = {sub: atmosphere.constructor.getKey('SlackChannelAddedSubscription', {teamId})};
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={slackChannelQuery}
      render={({error, props}) => {
        if (error) {
          return <div>{error.message}</div>
        } else if (props) {
          const {viewer} = props;
          return <SlackIntegrations
            viewer={viewer}
            teamId={teamId}
            teamMemberId={teamMemberId}
          />;
        } else {
          return <div>Loading...</div>
        }
      }}
      variables={{teamId, teamMemberId, service: SLACK}}
    />
  );
};


SlackIntegrationsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  teamMemberId: PropTypes.string.isRequired
};

export default withAtmosphere(SlackIntegrationsRoot);
