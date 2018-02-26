import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {cacheConfig, RETROSPECTIVE} from 'universal/utils/constants';
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription';
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription';
import TaskSubscription from 'universal/subscriptions/TaskSubscription';
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription';
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription';
import TeamSubscription from 'universal/subscriptions/TeamSubscription';
import NewMeeting from 'universal/components/NewMeeting';

const query = graphql`
  query RetroRootQuery($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    viewer {
      ...NewMeeting_viewer
    }
  }
`;

const subscriptions = [
  // AgendaItemSubscription,
  NewAuthTokenSubscription,
  NotificationSubscription,
  OrganizationSubscription,
  TaskSubscription,
  TeamMemberSubscription,
  TeamSubscription
];

const RetroRoot = ({atmosphere, match}) => {
  const {params: {localPhase, teamId}} = match;
  console.log('match', match)
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId, meetingType: RETROSPECTIVE}}
      subscriptions={subscriptions}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<NewMeeting localPhase={localPhase} />}
        />
      )}
    />
  );
};

export default withAtmosphere(RetroRoot);
