import relayEnv from 'client/relayEnv';
import PropTypes from 'prop-types';
import React from 'react';
import {graphql, QueryRenderer} from 'react-relay';
import SlackIntegrations from 'universal/modules/teamDashboard/components/SlackIntegrations/SlackIntegrations';
import {SLACK} from 'universal/utils/constants';

const slackChannelQuery = graphql`
  query SlackIntegrationsRootQuery($teamId: ID!, $teamMemberId: ID!, $service: ID!) {
    viewer {
      ...SlackIntegrations_viewer
    }
  }
`;

const SlackIntegrationsRoot = ({teamMemberId}) => {
  const [, teamId] = teamMemberId.split('::');
  return (
    <QueryRenderer
      environment={relayEnv.get()}
      query={slackChannelQuery}
      render={({error, props}) => {
        console.log('renderer', error, props)
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
  teamMemberId: PropTypes.string.isRequired
};

export default SlackIntegrationsRoot;
