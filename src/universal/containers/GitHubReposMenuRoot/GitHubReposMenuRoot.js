/* eslint-disable no-undef */
import PropTypes from 'prop-types';
import React from 'react';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import GitHubRepoAddedSubscription from 'universal/subscriptions/GitHubRepoAddedSubscription';
import GitHubRepoRemovedSubscription from 'universal/subscriptions/GitHubRepoRemovedSubscription';
import IntegrationJoinedSubscription from 'universal/subscriptions/IntegrationJoinedSubscription';
import IntegrationLeftSubscription from 'universal/subscriptions/IntegrationLeftSubscription';
import ProviderAddedSubscription from 'universal/subscriptions/ProviderAddedSubscription';
import ProviderRemovedSubscription from 'universal/subscriptions/ProviderRemovedSubscription';
import {DEFAULT_TTL, GITHUB} from 'universal/utils/constants';
import GitHubMemberRemovedSubscription from 'universal/subscriptions/GitHubMemberRemovedSubscription';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH, HUMAN_ADDICTION_THRESH, MAX_WAIT_TIME} from 'universal/styles/ui';
import Loadable from 'react-loadable';
import LoadableLoading from 'universal/components/LoadableLoading';
import RelayLoadableTransitionGroup from 'universal/components/RelayLoadableTransitionGroup';

const githubRepoQuery = graphql`
  query GitHubReposMenuRootQuery($teamId: ID!) {
    viewer {
      ...GitHubRepoListMenu_viewer
    }
  }
`;

const loading = (props) => <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />;
const LoadableGitHubRepoListMenu = Loadable({
  loader: () => System.import(
    /* webpackChunkName: 'GitHubRepoListMenu' */
    'universal/modules/outcomeCard/components/GitHubRepoListMenu/GitHubRepoListMenu'
  ),
  loading,
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
});

const subscriptions = [
  GitHubRepoAddedSubscription,
  GitHubRepoRemovedSubscription,
  GitHubMemberRemovedSubscription,
  ProviderRemovedSubscription,
  ProviderAddedSubscription,
  IntegrationLeftSubscription(GITHUB),
  IntegrationJoinedSubscription(GITHUB)

];

const cacheConfig = {ttl: DEFAULT_TTL};

const GitHubReposMenuRoot = (rootProps) => {
  const {
    area,
    atmosphere,
    handleAddTask,
    taskId,
    teamId,
    setError,
    clearError,
    closePortal
  } = rootProps;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={githubRepoQuery}
      variables={{teamId, service: GITHUB}}
      subscriptions={subscriptions}
      render={(readyState) => (
        <RelayLoadableTransitionGroup
          LoadableComponent={LoadableGitHubRepoListMenu}
          loading={loading}
          readyState={readyState}
          extraProps={{area, closePortal, handleAddTask, teamId, taskId, setError, clearError}}
        />
      )}
    />
  );
};

GitHubReposMenuRoot.propTypes = {
  area: PropTypes.string,
  atmosphere: PropTypes.object.isRequired,
  handleAddTask: PropTypes.func,
  taskId: PropTypes.string.isRequired,
  teamId: PropTypes.string.isRequired,
  viewer: PropTypes.object,
  setError: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired,
  closePortal: PropTypes.func.isRequired
};

export default withAtmosphere(GitHubReposMenuRoot);
