import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Avatar from 'universal/components/Avatar/Avatar';
import Button from 'universal/components/Button/Button';
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow';
import LeaveIntegrationMutation from 'universal/mutations/LeaveIntegrationMutation';
import formError from 'universal/styles/helpers/formError';
import withStyles from 'universal/styles/withStyles';
import {setError, clearError} from 'universal/utils/relay/mutationCallbacks';

class GitHubRepoRow extends Component {
  state = {};

  render() {
    const {environment, styles, viewerId, teamId, repo} = this.props;
    const {id, nameWithOwner, teamMembers} = repo;
    const handleUnlinkMe = (githubGlobalId) => () => {
      LeaveIntegrationMutation(environment, githubGlobalId, teamId, viewerId, setError.bind(this), clearError.bind(this));
    };
    const {error} = this.state;
    return (
      <div className={css(styles.rowAndError)}>
        <IntegrationRow>
          <div className={css(styles.nameWithOwner)}>{nameWithOwner}</div>
          {teamMembers.map((user) => <Avatar key={user.id} {...user} size="smaller"/>)}
          <Button
            buttonStyle="flat"
            colorPalette="dark"
            label="Unlink Me"
            onClick={handleUnlinkMe(id)}
            size="smallest"
          />
        </IntegrationRow>
        {error && <div className={css(styles.errorRow)}>{error}</div>}
      </div>
    );
  }

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
  }
});

export default withStyles(styleThunk)(GitHubRepoRow)
