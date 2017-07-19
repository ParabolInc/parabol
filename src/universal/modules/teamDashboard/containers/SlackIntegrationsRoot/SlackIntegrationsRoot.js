import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import SlackIntegrations from 'universal/modules/teamDashboard/components/SlackIntegrations/SlackIntegrations';
import {SLACK} from 'universal/utils/constants';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import {connect} from 'react-redux';

const slackChannelQuery = graphql`
  query SlackIntegrationsRootQuery($teamId: ID!, $service: IntegrationService!) {
    viewer {
      ...SlackIntegrations_viewer
    }
  }
`;

const mapStateToProps = (state) => {
  return {
    jwt: state.auth.token
  };
};

const SlackIntegrationsRoot = ({atmosphere, jwt, teamMemberId}) => {
  const [, teamId] = teamMemberId.split('::');
  const cacheConfig = {sub: atmosphere.constructor.getKey('SlackChannelAddedSubscription', {teamId})};
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={slackChannelQuery}
      variables={{teamId, service: SLACK}}
      render={({error, props}) => {
        if (error) {
          return <ErrorComponent height={'14rem'} error={error} />;
        } else if (props) {
          const {viewer} = props;
          return (<SlackIntegrations
            jwt={jwt}
            viewer={viewer}
            teamId={teamId}
            teamMemberId={teamMemberId}
          />);
        }
        return <LoadingComponent height={'14rem'} />;
      }}

    />
  );
};


SlackIntegrationsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  jwt: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired,
  viewer: PropTypes.object
};

export default withAtmosphere(connect(mapStateToProps)(SlackIntegrationsRoot));
