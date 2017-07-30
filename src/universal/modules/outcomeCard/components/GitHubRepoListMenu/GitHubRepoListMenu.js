import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import MenuItem from 'universal/modules/menu/components/MenuItem/MenuItem';
import CreateGitHubIssueMutation from 'universal/mutations/CreateGitHubIssueMutation';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import PropTypes from 'prop-types';

class GitHubRepoListMenu extends Component {
  static propTypes = {
    setLoading: PropTypes.func.isRequired,
    viewer: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    closePortal: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    setError: PropTypes.func.isRequired,
    clearError: PropTypes.func.isRequired,
    teamId: PropTypes.string.isRequired
  }

  componentWillMount() {
    const {setLoading, viewer: {githubRepos}} = this.props;
    setLoading(false);
    this.filterRepos(githubRepos);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {githubRepos}} = nextProps;
    if (githubRepos !== this.props.viewer.githubRepos) {
      this.filterRepos(githubRepos);
    }
  }

  filterRepos(githubRepos) {
    const {relay: {environment}} = this.props;
    const {id: userId} = fromGlobalId(environment.viewerId);
    const filteredRepos = githubRepos.filter((repo) => repo.userIds.includes(userId));
    // technically, someone could leave all integrations but still be integrated.
    this.filteredRepos = filteredRepos.length === 0 ? githubRepos : filteredRepos;
  }

  render() {
    const {relay: {environment}, history, closePortal, projectId, setError, clearError, teamId} = this.props;
    if (this.filteredRepos.length === 0) {
      return (
        <div>
          <MenuItem
            label="Add your first GitHub Repo"
            onClick={() => history.push(`/team/${teamId}/settings/integrations/github`)}
            closePortal={closePortal}
          />
        </div>
      );
    }
    return (
      <div>
        {this.filteredRepos.map((repo) => {
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
}

GitHubRepoListMenu.propTypes = {};

export default createFragmentContainer(
  withRouter(GitHubRepoListMenu),
  graphql`
    fragment GitHubRepoListMenu_viewer on User {
      githubRepos(teamId: $teamId) {
        nameWithOwner
        userIds
      }
    }
  `
);
