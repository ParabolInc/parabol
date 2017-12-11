import PropTypes from 'prop-types';
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamSettings from 'universal/modules/teamDashboard/components/TeamSettings/TeamSettings';
import TeamMemberAddedSubscription from 'universal/subscriptions/TeamMemberAddedSubscription';
import TeamMemberUpdatedSubscription from 'universal/subscriptions/TeamMemberUpdatedSubscription';
import {cacheConfig} from 'universal/utils/constants';

const query = graphql`
  query TeamSettingsRootQuery($teamId: ID!) {
    viewer {
      ...TeamSettings_viewer
    }
  }
`;

const subscriptions = [
  TeamMemberAddedSubscription,
  TeamMemberUpdatedSubscription
];

const TeamSettingsRoot = ({atmosphere, teamId}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<TeamSettings />}
        />
      )}
    />
  );
};

TeamSettingsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired
};

export default withAtmosphere(TeamSettingsRoot);
