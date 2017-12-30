import PropTypes from 'prop-types';
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamSettings from 'universal/modules/teamDashboard/components/TeamSettings/TeamSettings';
import InvitationAddedSubscription from 'universal/subscriptions/InvitationAddedSubscription';
import InvitationRemovedSubscription from 'universal/subscriptions/InvitationRemovedSubscription';
import InvitationUpdatedSubscription from 'universal/subscriptions/InvitationUpdatedSubscription';
import OrgApprovalSubscription from 'universal/subscriptions/OrgApprovalSubscription';
import {cacheConfig} from 'universal/utils/constants';

const query = graphql`
  query TeamSettingsRootQuery($teamId: ID!) {
    viewer {
      ...TeamSettings_viewer
    }
  }
`;

const subscriptions = [
  InvitationAddedSubscription,
  InvitationRemovedSubscription,
  InvitationUpdatedSubscription,
  OrgApprovalSubscription
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
