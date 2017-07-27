import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import MenuItem from 'universal/modules/menu/components/MenuItem/MenuItem';

class GitHubRepoListMenu extends Component {
  componentWillMount() {
    const {setLoading} = this.props;
    setLoading(false);
  }

  render() {
    const {viewer, closePortal} = this.props;
    const {githubRepos} = viewer;
    return (
      <div>
        {githubRepos.map((repo) => {
          return (
            <MenuItem
              isActive={false}
              key={`githubReposMenItem${repo.id}`}
              label={repo.nameWithOwner}
              onClick={() => console.log('click')}
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
    fragment OutcomeCardGitHubMenu_viewer on User {
      githubRepos(teamId: $teamId) {
        id
        nameWithOwner
      }
    }
  `
);