import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import MenuItem from 'universal/modules/menu/components/MenuItem/MenuItem';
import CreateGitHubIssueMutation from 'universal/mutations/CreateGitHubIssueMutation';

class GitHubRepoListMenu extends Component {
  componentWillMount() {
    const {setLoading} = this.props;
    setLoading(false);
  }

  render() {
    const {relay: {environment}, viewer, closePortal, projectId, setError, clearError} = this.props;
    const {githubRepos} = viewer;
    const onError = (err) => {console.log('error', err)};
    const onCompleted = () => {console.log('comp')};
    return (
      <div>
        {githubRepos.map((repo) => {
          const {nameWithOwner} = repo;
          return (
            <MenuItem
              isActive={false}
              key={`githubReposMenItem${nameWithOwner}`}
              label={nameWithOwner}
              onClick={() => CreateGitHubIssueMutation(environment, nameWithOwner, projectId, setError, clearError)}
              closePortal={closePortal}
            />
          );
        })}
      </div>
    );
  }

};

GitHubRepoListMenu.propTypes = {
};

export default createFragmentContainer(
  GitHubRepoListMenu,
  graphql`
    fragment GitHubRepoListMenu_viewer on User {
      githubRepos(teamId: $teamId) {
        nameWithOwner
      }
    }
  `
);