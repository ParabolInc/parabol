import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import AsyncMenuContainer from 'universal/modules/menu/containers/AsyncMenu/AsyncMenu';
import OutcomeCardMessage from 'universal/modules/outcomeCard/components/OutcomeCardMessage/OutcomeCardMessage';
import textOverflow from 'universal/styles/helpers/textOverflow';
import appTheme from 'universal/styles/theme/theme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {USER_DASH} from 'universal/utils/constants';
import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity';
import isProjectArchived from 'universal/utils/isProjectArchived';
import {clearError, setError} from 'universal/utils/relay/mutationCallbacks';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';

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

const height = ui.cardButtonHeight;

class OutcomeCardFooter extends Component {
  constructor(props) {
    super(props);
    this.setError = setError.bind(this);
    this.clearError = clearError.bind(this);
  }

  state = {};

  removeContentTag = (tagValue) => () => {
    const {atmosphere, outcome: {id, content}} = this.props;
    const eqFn = (data) => data.value === tagValue;
    const nextContent = removeAllRangesForEntity(content, 'TAG', eqFn);
    if (!nextContent) return;
    const updatedProject = {
      id,
      content: nextContent
    };
    UpdateProjectMutation(atmosphere, updatedProject);
  };

  render() {
    const {
      area,
      cardIsActive,
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
    const {teamMember: owner, integration, team} = outcome;
    const {service} = integration || {};
    const isArchived = isProjectArchived(outcome.tags);
    const buttonBlockStyles = css(
      styles.buttonBlock,
      cardIsActive && styles.showButtonBlock
    );
    const avatarStyles = css(
      styles.avatar,
      cardIsActive && styles.activeAvatar
    );
    const {error} = this.state;
    const ownerAvatarOrTeamName = (
      showTeam ?
        <div className={css(styles.teamNameLabel)}>{team.name}</div> :
        (<button
          className={css(styles.avatarButton)}
          tabIndex={service && '-1'}
          title={`Assigned to ${owner.preferredName}`}
          type="button"
        >
          <div className={avatarStyles}>
            <img
              alt={owner.preferredName}
              className={css(styles.avatarImg)}
              src={owner.picture}
              // hack because aphrodite loads styles on next tick, which causes the cell height adjuster to bork >:-(
              style={{height, width: height}}
            />
          </div>
          <div className={css(styles.avatarLabel)}>
            {owner.preferredName}
          </div>
        </button>)
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
                {/* buttonSpacer helps truncated names (…) be consistent */}
                {!service ?
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
                  /> :
                  <div className={css(styles.buttonSpacer)} />
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
  atmosphere: PropTypes.object.isRequired,
  cardIsActive: PropTypes.bool,
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

const label = {
  ...textOverflow,
  color: appTheme.palette.dark,
  display: 'block',
  flex: 1,
  fontSize: appTheme.typography.s2,
  fontWeight: 700,
  lineHeight: height,
  maxWidth: '100%',
  textAlign: 'left'
};

const styleThunk = () => ({
  footer: {
    // NOTE: height = ui.cardButtonHeight + (ui.cardPaddingBase * 2)
    display: 'flex',
    height: '2.5rem',
    justifyContent: 'space-between',
    maxWidth: '100%',
    padding: ui.cardPaddingBase
  },

  avatarButton: {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    cursor: 'pointer',
    display: 'flex',
    height,
    outline: 'none',
    margin: 0,
    maxWidth: '100%',
    padding: 0,

    ':hover > div': {
      borderColor: appTheme.palette.dark,
      color: appTheme.palette.dark10d
    },
    ':focus > div': {
      borderColor: appTheme.palette.dark,
      color: appTheme.palette.dark10d
    }
  },

  avatarBlock: {
    flex: 1,
    height,
    minWidth: 0
  },

  avatar: {
    // NOTE: height = ui.cardButtonHeight + .25rem (border + padding)
    backgroundColor: 'transparent',
    borderRadius: '100%',
    border: '.0625rem solid transparent',
    height: '1.75rem',
    marginLeft: '-.125rem',
    marginRight: '.25rem',
    padding: '.0625rem',
    position: 'relative',
    top: '-.125rem',
    width: '1.75rem'
  },

  activeAvatar: {
    borderColor: appTheme.palette.mid50l
  },

  avatarImg: {
    borderRadius: '100%',
    height,
    marginRight: '.25rem',
    width: height
  },

  avatarLabel: {
    ...label,
    flex: 1,
    minWidth: 0
  },

  teamNameLabel: {
    ...label
  },

  buttonBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
    opacity: 0
  },

  showButtonBlock: {
    opacity: 1
  },

  // buttonSpacer helps truncated names (…) be consistent
  buttonSpacer: {
    display: 'inline-block',
    height,
    verticalAlign: 'middle',
    width: height
  }
});

export default withAtmosphere(
  withStyles(styleThunk)(OutcomeCardFooter)
);
