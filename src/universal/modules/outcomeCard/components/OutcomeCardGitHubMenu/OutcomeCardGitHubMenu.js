import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withSubscriptions from 'universal/decorators/withSubscriptions.js/withSubscriptions';
import {Menu, MenuItem} from 'universal/modules/menu';
import withStyles from 'universal/styles/withStyles';
import GitHubRepoAddedSubscription from 'universal/subscriptions/GitHubRepoAddedSubscription';
import GitHubRepoRemovedSubscription from 'universal/subscriptions/GitHubRepoRemovedSubscription';
import IntegrationLeftSubscription from 'universal/subscriptions/IntegrationLeftSubscription';
import ProviderAddedSubscription from 'universal/subscriptions/ProviderAddedSubscription';
import ProviderRemovedSubscription from 'universal/subscriptions/ProviderRemovedSubscription';
import {GITHUB} from 'universal/utils/constants';

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
  console.log("repos", githubRepos)
  return (
    <Menu
      isLoaded={!githubRepos}
      label="Create a GitHub issue:"
      maxHeight="14.0625rem"
      originAnchor={originAnchor}
      targetAnchor={targetAnchor}
    >
      {githubRepos && githubRepos.map((repo) => {
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

  const subscriptionThunk = ({teamId, viewer: {id}}) => [
    GitHubRepoAddedSubscription(teamId, id),
    GitHubRepoRemovedSubscription(teamId, id),
    ProviderRemovedSubscription(teamId, id),
    ProviderAddedSubscription(teamId, id),
    IntegrationLeftSubscription(GITHUB, teamId, id)
  ];

export default createFragmentContainer(
  withSubscriptions(subscriptionThunk)(withStyles(styleThunk)(OutcomeCardGitHubMenu)),
  graphql`
    fragment OutcomeCardGitHubMenu_viewer on User {
      id
      githubRepos(teamId: $teamId) {
        id
        nameWithOwner
      }
    }
  `
);