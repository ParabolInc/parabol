import relayEnv from 'client/relayEnv';
import PropTypes from 'prop-types';
import React from 'react';
import {graphql, QueryRenderer} from 'react-relay';
import TeamIntegrations from 'universal/modules/teamDashboard/components/TeamIntegrations/TeamIntegrations';
import {connect} from 'react-redux';

const teamIntegrationQuery = graphql`
  query TeamIntegrationRootQuery($teamMemberId: ID!, $service: String!) {
    providerMap(teamMemberId: $teamMemberId) {
      ...ProviderList_providerMap    
    }
  }
`;

const mapStateToProps = (state) => {
  return {
    jwt: state.auth.token
  };
};

const TeamIntegrationRoot = ({jwt, teamMemberId}) => {
  return (
    <QueryRenderer
      environment={relayEnv.get()}
      query={teamIntegrationQuery}
      render={({error, props}) => {
        console.log('renderer', error, props)
        if (error) {
          return <div>{error.message}</div>
        } else if (props) {
          return <TeamIntegrations {...props} jwt={jwt} teamMemberId={teamMemberId} />;
        } else {
          return <div>Loading...</div>
        }
      }}
      variables={{teamMemberId}}
    />
  );
};


TeamIntegrationRoot.propTypes = {
  teamMemberId: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(TeamIntegrationRoot);
