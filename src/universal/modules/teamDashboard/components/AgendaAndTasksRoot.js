import PropTypes from 'prop-types';
import React from 'react';
import {withRouter} from 'react-router-dom';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import AgendaAndTasks from 'universal/modules/teamDashboard/components/AgendaAndTasks/AgendaAndTasks';
import AgendaItemSubscription from 'universal/subscriptions/AgendaItemSubscription';
import {cacheConfig} from 'universal/utils/constants';

const query = graphql`
  query AgendaAndTasksRootQuery($teamId: ID!) {
    viewer {
      ...AgendaAndTasks_viewer
    }
  }
`;

const subscriptions = [
  AgendaItemSubscription
];

const AgendaAndTasksRoot = (props) => {
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
          ready={<AgendaAndTasks />}
        />
      )}
    />
  );
};

AgendaAndTasksRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  teams: PropTypes.array
};

export default withRouter(withAtmosphere(AgendaAndTasksRoot));
