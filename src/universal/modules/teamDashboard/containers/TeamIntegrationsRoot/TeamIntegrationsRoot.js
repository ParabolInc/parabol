import relayEnv from 'client/relayEnv';
import PropTypes from 'prop-types';
import React from 'react';
import {graphql, QueryRenderer} from 'react-relay';
import TeamIntegrations from 'universal/modules/teamDashboard/components/TeamIntegrations/TeamIntegrations';

const teamIntegrationsQuery = graphql`
  query TeamIntegrationsRootQuery($teamMemberId: ID!) {
    providerMap(teamMemberId: $teamMemberId) {
      ...ProviderList_providerMap    
    }
  }
`;

const renderer = ({error, props}) => {
  console.log('renderer', error, props)
  if (error) {
    return <div>{error.message}</div>
  } else if (props) {
    return <TeamIntegrations {...props} />;
  } else {
    return <div>Loading...</div>
  }
};

const TeamIntegrationsRoot = (props) => {
  const {teamMemberId} = props;
  return (
    <QueryRenderer
      environment={relayEnv.get()}
      query={teamIntegrationsQuery}
      render={renderer}
      variables={{teamMemberId}}
    />
  );
};


TeamIntegrationsRoot.propTypes = {
  teamMemberId: PropTypes.string.isRequired
};

export default TeamIntegrationsRoot;
