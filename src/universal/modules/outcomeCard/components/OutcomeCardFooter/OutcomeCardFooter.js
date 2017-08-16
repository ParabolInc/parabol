import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import AsyncMenuContainer from 'universal/modules/menu/containers/AsyncMenu/AsyncMenu';
import OutcomeCardMessage from 'universal/modules/outcomeCard/components/OutcomeCardMessage/OutcomeCardMessage';
import appTheme from 'universal/styles/theme/theme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity';
import isProjectArchived from 'universal/utils/isProjectArchived';
import {clearError, setError} from 'universal/utils/relay/mutationCallbacks';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';
import {USER_DASH} from 'universal/utils/constants';

const fetchGitHubRepos = () => System.import('universal/containers/GitHubReposMenuRoot/GitHubReposMenuRoot');
const fetchStatusMenu = () => System.import('universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu');
const fetchAssignMenu = () => System.import('universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignMenu');

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const assignOriginAnchor = {
  vertical: 'bottom',
  horizontal: 'left'
};

const assignTargetAnchor = {
  vertical: 'top',
  horizontal: 'left'
};

class OutcomeCardFooter extends Component {
  constructor(props) {
    super(props);
    this.setError = setError.bind(this);
    this.clearError = clearError.bind(this);
  }

  state = {};

  removeContentTag = (tagValue) => () => {
    const {outcome: {id, content}} = this.props;
    const eqFn = (data) => data.value === tagValue;
    const rawContent = JSON.parse(content);
    const nextContent = removeAllRangesForEntity(rawContent, 'TAG', eqFn);
    if (nextContent) {
      const options = {
        ops: {},
        variables: {
          updatedProject: {
            id,
            content: nextContent
          }
        }
      };
      cashay.mutate('updateProject', options);
    }
  };

  render() {
    const {
      area,
      cardHasFocus,
      cardHasHover,
      editorState,
      handleAddProject,
      isAgenda,
      isPrivate,
      outcome,
      styles,
      teamMembers,
      toggleMenuState
    } = this.props;
    const showTeam = area === USER_DASH;
    const {teamMember: owner, integration, team: {name: teamName}} = outcome;
    const {service} = integration || {};
    const isArchived = isProjectArchived(outcome.tags);

    const buttonBlockStyles = css(
      styles.buttonBlock,
      cardHasFocus && styles.showBlock,
      cardHasHover && styles.showBlock
    );

    const avatarStyles = css(
      styles.avatar,
      (cardHasHover || cardHasFocus) && styles.activeAvatar
    );

    const {error} = this.state;
    const ownerAvatarOrTeamName = (
      showTeam ?
        <div className={css(styles.teamName)}>{teamName}</div> :
        (<div className={avatarStyles} tabIndex="0">
          <img
            alt={owner.preferredName}
            className={css(styles.avatarImg)}
            src={owner.picture}
          />
        </div>)
    );

    return (
      <div className={css(styles.footerAndMessage)}>
        <div className={css(styles.footer)}>
          <div className={css(styles.avatarBlock)}>
            {service || showTeam ?
              ownerAvatarOrTeamName :
              <AsyncMenuContainer
                fetchMenu={fetchAssignMenu}
                maxWidth={350}
                maxHeight={225}
                originAnchor={assignOriginAnchor}
                queryVars={{
                  projectId: outcome.id,
                  ownerId: owner.id,
                  teamMembers,
                  setError: this.setError,
                  clearError: this.clearError
                }}
                targetAnchor={assignTargetAnchor}
                toggle={ownerAvatarOrTeamName}
                toggleMenuState={toggleMenuState}
              />
            }
          </div>
          <div className={buttonBlockStyles}>
            {isArchived ?
              <OutcomeCardFooterButton onClick={this.removeContentTag('archived')} icon="reply" /> :
              <div>
                {!service &&
                <AsyncMenuContainer
                  fetchMenu={fetchGitHubRepos}
                  maxWidth={350}
                  maxHeight={225}
                  originAnchor={originAnchor}
                  queryVars={{
                    area,
                    handleAddProject,
                    projectId: outcome.id,
                    setError: this.setError,
                    clearError: this.clearError
                  }}
                  targetAnchor={targetAnchor}
                  toggle={<OutcomeCardFooterButton icon="github" />}
                  toggleMenuState={toggleMenuState}
                />
                }
                <AsyncMenuContainer
                  fetchMenu={fetchStatusMenu}
                  maxWidth={200}
                  maxHeight={225}
                  originAnchor={originAnchor}
                  queryVars={{
                    editorState,
                    isAgenda,
                    isPrivate,
                    outcome,
                    removeContentTag: this.removeContentTag
                  }}
                  targetAnchor={targetAnchor}
                  toggle={<OutcomeCardFooterButton icon="ellipsis-v" />}
                  toggleMenuState={toggleMenuState}
                />
              </div>
            }
          </div>
        </div>
        {error &&
        <OutcomeCardMessage
          onClose={this.clearError}
          message={error}
        />
        }
      </div>
    );
  }
}

OutcomeCardFooter.propTypes = {
  area: PropTypes.string.isRequired,
  cardHasFocus: PropTypes.bool,
  cardHasHover: PropTypes.bool,
  editorState: PropTypes.object,
  handleAddProject: PropTypes.func,
  isAgenda: PropTypes.bool,
  isArchived: PropTypes.bool,
  isPrivate: PropTypes.bool,
  outcome: PropTypes.object,
  showTeam: PropTypes.bool,
  styles: PropTypes.object,
  teamMembers: PropTypes.array,
  toggleMenuState: PropTypes.func.isRequired
};

const styleThunk = () => ({
  activeAvatar: {
    borderColor: appTheme.palette.mid50l
  },

  avatar: {
    borderRadius: '100%',
    border: '.0625rem solid transparent',
    cursor: 'pointer',
    height: '1.75rem',
    marginLeft: '-.125rem',
    outline: 'none',
    padding: '.0625rem',
    position: 'relative',
    width: '1.75rem',

    ':hover': {
      borderColor: appTheme.palette.dark
    },
    ':focus': {
      borderColor: appTheme.palette.dark
    }
  },

  avatarBlock: {
    flex: 1
  },

  avatarImg: {
    borderRadius: '100%',
    height: '1.5rem',
    width: '1.5rem'
  },

  buttonBlock: {
    opacity: 0
  },

  footer: {
    display: 'flex',
    height: '2.5rem',
    padding: ui.cardPaddingBase
  },

  teamName: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: '1.5rem',
    verticalAlign: 'middle'
  },

  showBlock: {
    opacity: 1
  }
});

export default withStyles(styleThunk)(OutcomeCardFooter);
