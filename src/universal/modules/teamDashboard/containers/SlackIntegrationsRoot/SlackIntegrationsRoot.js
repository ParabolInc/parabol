import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import SlackIntegrations from 'universal/modules/teamDashboard/components/SlackIntegrations/SlackIntegrations';
import {SLACK} from 'universal/utils/constants';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';

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
          return <ErrorComponent height={'14rem'} errorMessage={error.message}/>;
        } else if (props) {
          const {viewer} = props;
          return (<SlackIntegrations
            viewer={viewer}
            teamId={teamId}
            teamMemberId={teamMemberId}
          />);
        }
        return <LoadingComponent height={'14rem'}/>
      }}
      variables={{teamId, teamMemberId, service: SLACK}}
    />
  );
};


SlackIntegrationsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  teamMemberId: PropTypes.string.isRequired,
  viewer: PropTypes.object
};

export default withAtmosphere(SlackIntegrationsRoot);
