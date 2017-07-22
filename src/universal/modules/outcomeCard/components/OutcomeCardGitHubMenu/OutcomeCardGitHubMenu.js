import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withSubscriptions from 'universal/decorators/withSubscriptions.js/withSubscriptions';
import {Menu, MenuItem} from 'universal/modules/menu';
import {textOverflow} from 'universal/styles/helpers';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import GitHubRepoAddedSubscription from 'universal/subscriptions/GitHubRepoAddedSubscription';
import GitHubRepoRemovedSubscription from 'universal/subscriptions/GitHubRepoRemovedSubscription';
import IntegrationLeftSubscription from 'universal/subscriptions/IntegrationLeftSubscription';
import ProviderAddedSubscription from 'universal/subscriptions/ProviderAddedSubscription';
import ProviderRemovedSubscription from 'universal/subscriptions/ProviderRemovedSubscription';
import {GITHUB} from 'universal/utils/constants';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';

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
  editorState: PropTypes.object,
  outcome: PropTypes.object,
  isAgenda: PropTypes.bool,
  onComplete: PropTypes.func,
  styles: PropTypes.object,
  setIntegrationStyles: PropTypes.func
};

const buttonHF = {
  backgroundColor: 'transparent',
  borderColor: appTheme.palette.mid50l
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    fontSize: 0,
    justifyContent: 'center',
    margin: '0 auto',
    maxWidth: '12rem',
    minHeight: '5.1875rem',
    padding: '.125rem',
    textAlign: 'center',
    width: '100%'
  },

  column: {
    display: 'inline-block',
    fontSize: '1rem',
    padding: '.25rem',
    width: '50%'
  },

  button: {
    backgroundColor: 'transparent',
    border: `1px solid ${appTheme.palette.mid30l}`,
    borderRadius: '.25rem',
    color: appTheme.palette.dark,
    cursor: 'pointer',
    margin: 0,
    outline: 'none',
    padding: '.25rem .5rem',
    width: '100%',

    ':hover': {
      ...buttonHF
    },
    ':focus': {
      ...buttonHF,
      borderColor: appTheme.palette.dark90d
    }
  },

  buttonBlock: {
    padding: '.25rem',
    width: '100%'
  },

  label: {
    fontWeight: 700,
    textTransform: 'uppercase'
  },

  disabled: {
    cursor: 'not-allowed',
    opacity: '.35'
  },

  ...projectStatusStyles('color'),

  archive: {
    color: labels.archive.color
  },
  archived: {
    color: labels.archived.color
  },

  label: {
    ...textOverflow,
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal} 0 0`
  }
});

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