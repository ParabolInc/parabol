import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import Avatar from 'universal/components/Avatar/Avatar';
import Button from 'universal/components/Button/Button';
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
    const {id, nameWithOwner, teamMembers} = repo;

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
    return (
      <div className={css(styles.rowAndError)}>
        <IntegrationRow>
          <a
            className={css(styles.nameWithOwner)}
            href={`https://github.com/${nameWithOwner}`}
            rel="noopener noreferrer"
            target="_blank"
            title={nameWithOwner}
          >
            {nameWithOwner}
            <FontAwesome name="external-link-square" style={{marginLeft: '.5rem'}} />
          </a>
          <div className={css(styles.avatarGroup)}>
            {teamMembers.map((user) => (
              <div key={user.id} className={css(styles.avatar)}>
                <Avatar {...user} size="smallest" />
              </div>
            ))}
          </div>
          {accessToken &&
          <Button
            buttonStyle="flat"
            colorPalette="dark"
            label={viewerInIntegration ? 'Unlink Me' : 'Link Me'}
            onClick={toggleIntegrationMembership(id)}
            size="smallest"
          />
          }
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
  errorRow: {
    ...formError,
    marginTop: '-1rem',
    padding: '0 1rem',
    textAlign: 'end'
  },

  rowAndError: {
    display: 'flex',
    flexDirection: 'column'
  },

  nameWithOwner: {
    display: 'block',
    fontSize: appTheme.typography.s3,
    fontWeight: 700
  },

  avatarGroup: {
    padding: '0 .5rem 0 1rem'
  },

  avatar: {
    margin: '0 .5rem 0 0'
  }
});

export default withStyles(styleThunk)(GitHubRepoRow);
