import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {graphql} from 'react-relay';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamIntegrations from 'universal/modules/teamDashboard/components/TeamIntegrations/TeamIntegrations';

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

const TeamIntegrationsRoot = ({jwt, atmosphere, teamMemberId}) => {
  const [, teamId] = teamMemberId.split('::');
  const cacheConfig = {sub: atmosphere.constructor.getKey('ProviderSubscription', {teamId})};
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={teamIntegrationsQuery}
      variables={{teamId}}
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
