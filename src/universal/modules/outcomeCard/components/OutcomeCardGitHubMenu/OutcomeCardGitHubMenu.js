import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {Menu} from 'universal/modules/menu';
import MenuItem from 'universal/modules/menu/components/MenuItem/MenuItem';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};


const OutcomeCardGitHubMenu = (props) => {
  const {viewer} = props;
  const githubRepos = viewer && viewer.githubRepos;
  console.log('repos', githubRepos)
  if (!githubRepos) return null;
  return (
    <Menu
      isLoaded={!githubRepos}
      label="Create a GitHub issue:"
      maxHeight="14.0625rem"
      originAnchor={originAnchor}
      targetAnchor={targetAnchor}
    >
      {githubRepos.map((repo) => {
        return (
          <MenuItem
            isActive={false}
            key={`githubReposMenItem${repo.id}`}
            label={repo.nameWithOwner}
            onClick={() => console.log('click')}
          />
        );
      })}
    </Menu>
  );

};

OutcomeCardGitHubMenu.propTypes = {
  outcome: PropTypes.object,
  setIntegrationStyles: PropTypes.func
};

export default createFragmentContainer(
  OutcomeCardGitHubMenu,
  graphql`
    fragment OutcomeCardGitHubMenu_viewer on User {
      githubRepos(teamId: $teamId) {
        id
        nameWithOwner
      }
    }
  `
);