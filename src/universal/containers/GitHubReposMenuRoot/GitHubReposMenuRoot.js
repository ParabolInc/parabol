/* eslint-disable no-undef */
import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import SetLoading from 'universal/components/SetLoading';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import GitHubRepoListMenu from 'universal/modules/outcomeCard/components/GitHubRepoListMenu/GitHubRepoListMenu';
import GitHubRepoAddedSubscription from 'universal/subscriptions/GitHubRepoAddedSubscription';
import GitHubRepoRemovedSubscription from 'universal/subscriptions/GitHubRepoRemovedSubscription';
import IntegrationJoinedSubscription from 'universal/subscriptions/IntegrationJoinedSubscription';
import IntegrationLeftSubscription from 'universal/subscriptions/IntegrationLeftSubscription';
import ProviderAddedSubscription from 'universal/subscriptions/ProviderAddedSubscription';
import ProviderRemovedSubscription from 'universal/subscriptions/ProviderRemovedSubscription';
import {DEFAULT_TTL, GITHUB} from 'universal/utils/constants';

const githubRepoQuery = graphql`
  query GitHubReposMenuRootQuery($teamId: ID!) {
    viewer {
      ...GitHubRepoListMenu_viewer
    }
  }
`;


const subscriptions = [
  GitHubRepoAddedSubscription,
  GitHubRepoRemovedSubscription,
  ProviderRemovedSubscription,
  ProviderAddedSubscription,
  IntegrationLeftSubscription(GITHUB),
  IntegrationJoinedSubscription(GITHUB)
];

const cacheConfig = {ttl: DEFAULT_TTL};

const GitHubReposMenuRoot = ({atmosphere, projectId, setError, clearError, closePortal, setLoading}) => {
  const [teamId] = projectId.split('::');
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={githubRepoQuery}
      variables={{teamId, service: GITHUB}}
      subscriptions={subscriptions}
      render={({error, props}) => {
        // TODO handle the error within the menu
        if (error) {
          return <ErrorComponent height={'14rem'} error={error}/>;
        }
        if (props) {
          return (<GitHubRepoListMenu
            viewer={props.viewer}
            teamId={teamId}
            projectId={projectId}
            closePortal={closePortal}
            setError={setError}
            clearError={clearError}
            setLoading={setLoading}
          />);
        }
        return <SetLoading setLoading={setLoading}/>;
      }}
    />
  );
};


GitHubReposMenuRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  projectId: PropTypes.string.isRequired,
  viewer: PropTypes.object,
  setError: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired,
  closePortal: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired
};

export default withAtmosphere(GitHubReposMenuRoot);
