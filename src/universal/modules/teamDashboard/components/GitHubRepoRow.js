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
import withMutationProps from 'universal/utils/relay/withMutationProps';

const getViewerInIntegration = (props) => {
  const {environment: {userId}, teamId, repo: {teamMembers}} = props;
  const teamMemberId = `${userId}::${teamId}`;
  return Boolean(teamMembers.find((teamMember) => teamMember.id === teamMemberId));
};

class GitHubRepoRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewerInIntegration: getViewerInIntegration(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    const {repo} = nextProps;
    if (this.props.repo !== repo) {
      const viewerInIntegration = getViewerInIntegration(nextProps);
      if (viewerInIntegration !== this.state.viewerInIntegration) {
        this.setState({
          viewerInIntegration
        });
      }
    }
  }

  toggleIntegrationMembership = (githubGlobalId) => () => {
    const {environment, submitMutation, onError, onCompleted, teamId} = this.props;
    submitMutation();
    if (this.viewerInIntegration) {
      LeaveIntegrationMutation(environment, githubGlobalId, teamId, onError, onCompleted);
    } else {
      JoinIntegrationMutation(environment, githubGlobalId, teamId, onError, onCompleted);
    }
  };

  render() {
    const {accessToken, environment, error, submitting, styles, repo} = this.props;
    const {id, adminUserId, nameWithOwner, teamMembers} = repo;
    const {userId} = environment;
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
              buttonSize="small"
              buttonStyle="flat"
              colorPalette="dark"
              waiting={submitting}
              label={this.viewerInIntegration ? 'Unlink Me' : 'Link Me'}
              onClick={this.toggleIntegrationMembership(id)}
            />
            }
          </div>
        </IntegrationRow>
        {error && <div className={css(styles.errorRow)}>{error._error}</div>}
      </div>
    );
  }
}

GitHubRepoRow.propTypes = {
  error: PropTypes.object,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
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

export default withMutationProps(withStyles(styleThunk)(GitHubRepoRow));
