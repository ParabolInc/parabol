import relayEnv from 'client/relayEnv';
import React from 'react';
import {graphql, QueryRenderer} from 'react-relay';
import TeamIntegrations from 'universal/modules/teamDashboard/components/TeamIntegrations/TeamIntegrations';

const teamIntegrationsQuery = graphql`
  query getProviders {
    viewer {
      ...ListPage_viewer
    }
  }
`;

const renderer = ({error, props}) => {
  if (error) {
    return <div>{error.message}</div>
  } else if (props) {
    return <TeamIntegrations viewer={props.viewer}/>;
  } else {
    return <div>Loading...</div>
  }
};

const TeamIntegrationsRoot = () => {
  return (
    <QueryRenderer
      environment={relayEnv.get()}
      query={teamIntegrationsQuery}
      render={renderer}
    />
  );
};

export default TeamIntegrationsRoot;
