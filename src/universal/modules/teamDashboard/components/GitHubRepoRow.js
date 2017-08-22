import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import Avatar from 'universal/components/Avatar/Avatar';
import Button from 'universal/components/Button/Button';
import Tag from 'universal/components/Tag/Tag';
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow';
import JoinIntegrationMutation from 'universal/mutations/JoinIntegrationMutation';
import LeaveIntegrationMutation from 'universal/mutations/LeaveIntegrationMutation';
import formError from 'universal/styles/helpers/formError';
import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import {clearError, setError} from 'universal/utils/relay/mutationCallbacks';
import toGlobalId from 'universal/utils/relay/toGlobalId';

class GitHubRepoRow extends Component {
  constructor(props) {
    super(props);
    this.setError = setError.bind(this);
    this.clearError = clearError.bind(this);
  }

  state = {};

  render() {
    const {accessToken, environment, styles, teamId, repo} = this.props;
    const {id, adminUserId, nameWithOwner, teamMembers} = repo;

    const {id: userId} = fromGlobalId(environment.viewerId);
    const teamMemberId = `${userId}::${teamId}`;
    const globalTeamMemberId = toGlobalId('TeamMember', teamMemberId);
    const viewerInIntegration = Boolean(teamMembers.find((teamMember) => teamMember.id === globalTeamMemberId));
    const toggleIntegrationMembership = (githubGlobalId) => () => {
      if (viewerInIntegration) {
        LeaveIntegrationMutation(environment, githubGlobalId, teamId, this.setError, this.clearError);
      } else {
        JoinIntegrationMutation(environment, githubGlobalId, teamId, this.setError, this.clearError);
      }
    };
    const {error} = this.state;
    const isCreator = adminUserId === userId;
    return (
      <div className={css(styles.rowAndError)}>
        <IntegrationRow>
          <div className={css(styles.repoName)}>
            <a
              className={css(styles.nameWithOwner)}
              href={`https://github.com/${nameWithOwner}`}
              rel="noopener noreferrer"
              target="_blank"
              title={nameWithOwner}
            >
              {nameWithOwner}
              <FontAwesome name="external-link-square" style={{marginLeft: '.5rem'}} />
              {isCreator && <Tag colorPalette="light" label="Creator" />}
            </a>
          </div>
          <div className={css(styles.avatarGroup)}>
            {teamMembers.map((user) => (
              <div key={user.id} className={css(styles.avatar)}>
                <Avatar {...user} size="smallest" />
              </div>
            ))}
          </div>
          <div className={css(styles.actionButton)}>
            {accessToken && !isCreator &&
            <Button
              buttonStyle="flat"
              colorPalette="dark"
              label={viewerInIntegration ? 'Unlink Me' : 'Link Me'}
              onClick={toggleIntegrationMembership(id)}
              size="smallest"
            />
            }
          </div>
        </IntegrationRow>
        {error && <div className={css(styles.errorRow)}>{error}</div>}
      </div>
    );
  }
}

GitHubRepoRow.propTypes = {
  accessToken: PropTypes.string,
  environment: PropTypes.object,
  styles: PropTypes.object,
  teamId: PropTypes.string,
  repo: PropTypes.object
};

const styleThunk = () => ({
  actionButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    minWidth: '7rem'
  },

  avatarGroup: {
    marginLeft: 'auto',
    padding: '0 .5rem 0 1rem',
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end'
  },

  errorRow: {
    ...formError,
    marginTop: '-1rem',
    padding: '0 1rem',
    textAlign: 'end'
  },

  repoName: {
    display: 'flex'
  },

  rowAndError: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },

  nameWithOwner: {
    display: 'block',
    flex: 1,
    fontSize: appTheme.typography.s3,
    fontWeight: 700
  },

  avatar: {
    display: 'inline-block',
    margin: '0 .5rem 0 0'
  }
});

export default withStyles(styleThunk)(GitHubRepoRow);
