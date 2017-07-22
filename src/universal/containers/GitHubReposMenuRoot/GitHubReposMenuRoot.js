import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OutcomeCardGitHubMenu from 'universal/modules/outcomeCard/components/OutcomeCardGitHubMenu/OutcomeCardGitHubMenu';
import {GITHUB} from 'universal/utils/constants';

const githubRepoQuery = graphql`
  query GitHubReposMenuRootQuery($teamId: ID!) {
    viewer {
      ...OutcomeCardGitHubMenu_viewer
    } 
  }
`;

const GitHubReposMenuRoot = ({atmosphere, teamId, projectId}) => {
  const cacheConfig = {sub: atmosphere.constructor.getKey('GitHubRepoAddedSubscription', {teamId})};
  console.log('root!')
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={githubRepoQuery}
      variables={{teamId, service: GITHUB}}
      render={({error, props}) => {
        // TODO handle the error within the menu
        if (error) {
          return <ErrorComponent height={'14rem'} error={error}/>;
        }
        const viewer = props && props.viewer;
        return (<OutcomeCardGitHubMenu
          viewer={viewer}
          teamId={teamId}
          projectId={projectId}
        />);
      }}

    />
  );
};


GitHubReposMenuRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  viewer: PropTypes.object
};

export default withAtmosphere(GitHubReposMenuRoot);
