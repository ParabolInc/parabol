import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {graphql} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamIntegrations from 'universal/modules/teamDashboard/components/TeamIntegrations/TeamIntegrations';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';

// import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger';

const teamIntegrationsQuery = graphql`
  query TeamIntegrationsRootQuery($teamMemberId: ID!) {
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

const TeamIntegrationsRoot = ({jwt, atmosphere, teamMemberId}) => {
  const [, teamId] = teamMemberId.split('::');
  const cacheConfig = {sub: atmosphere.constructor.getKey('ProviderSubscription', {teamId})};
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={teamIntegrationsQuery}
      render={({error, props}) => {
        if (error) {
          return <div>{error.message}</div>;
        } else if (props) {
          return <TeamIntegrations viewer={props.viewer} jwt={jwt} teamMemberId={teamMemberId} />;
        }
        return <div>Loading...</div>;
      }}
      variables={{teamMemberId}}
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
