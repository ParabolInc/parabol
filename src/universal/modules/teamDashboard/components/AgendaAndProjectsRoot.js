import ms from 'ms';
import PropTypes from 'prop-types';
import React from 'react';
import {withRouter} from 'react-router-dom';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import AgendaAndProjects from 'universal/modules/teamDashboard/components/AgendaAndProjects/AgendaAndProjects';
import AgendaItemAddedSubscription from 'universal/subscriptions/AgendaItemAddedSubscription';
import AgendaItemRemovedSubscription from 'universal/subscriptions/AgendaItemRemovedSubscription';
import AgendaItemUpdatedSubscription from 'universal/subscriptions/AgendaItemUpdatedSubscription';
import ProjectCreatedSubscription from 'universal/subscriptions/ProjectCreatedSubscription';
import ProjectDeletedSubscription from 'universal/subscriptions/ProjectDeletedSubscription';
import ProjectUpdatedSubscription from 'universal/subscriptions/ProjectUpdatedSubscription';

const query = graphql`
  query AgendaAndProjectsRootQuery($teamId: ID!) {
    viewer {
      ...AgendaAndProjects_viewer
    }
  }
`;

const subscriptions = [
  ProjectUpdatedSubscription,
  ProjectCreatedSubscription,
  ProjectDeletedSubscription,
  AgendaItemAddedSubscription,
  AgendaItemUpdatedSubscription,
  AgendaItemRemovedSubscription
];
const cacheConfig = {ttl: ms('10s')};

const AgendaAndProjectsRoot = (props) => {
  const {atmosphere, match: {params: {teamId}}} = props;
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
          ready={<AgendaAndProjects />}
        />
      )}
    />
  );
};

AgendaAndProjectsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  teams: PropTypes.array
};

export default withRouter(withAtmosphere(AgendaAndProjectsRoot));
