import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OutcomeCardMessage from 'universal/modules/outcomeCard/components/OutcomeCardMessage/OutcomeCardMessage';
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation';
import textOverflow from 'universal/styles/helpers/textOverflow';
import appTheme from 'universal/styles/theme/theme';
import ui, {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH, HUMAN_ADDICTION_THRESH, MAX_WAIT_TIME} from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {USER_DASH} from 'universal/utils/constants';
import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity';
import isTaskArchived from 'universal/utils/isTaskArchived';
import {clearError, setError} from 'universal/utils/relay/mutationCallbacks';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';
import avatarUser from 'universal/styles/theme/images/avatar-user.svg';
import Loadable from 'react-loadable';
import LoadableMenu from 'universal/components/LoadableMenu';
import LoadableLoading from 'universal/components/LoadableLoading';

const LoadableAssignMenu = Loadable({
  loader: () => System.import(
    /* webpackChunkName: 'OutcomeCardAssignMenuRoot' */
    'universal/modules/outcomeCard/components/OutcomeCardAssignMenuRoot'
  ),
  loading: (props) => <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />,
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
});

const LoadableStatusMenu = Loadable({
  loader: () => System.import(
    /* webpackChunkName: 'OutcomeCardStatusMenu' */
    'universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu'
  ),
  loading: (props) => <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />,
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
});

const LoadableGitHubMenu = Loadable({
  loader: () => System.import(
    /* webpackChunkName: 'GitHubReposMenuRoot' */
    'universal/containers/GitHubReposMenuRoot/GitHubReposMenuRoot'
  ),
  loading: (props) => <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />,
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
});

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
    const {area, atmosphere, task: {taskId, content}} = this.props;
    const eqFn = (data) => data.value === tagValue;
    const nextContent = removeAllRangesForEntity(content, 'TAG', eqFn);
    if (!nextContent) return;
    const updatedTask = {
      id: taskId,
      content: nextContent
    };
    UpdateTaskMutation(atmosphere, updatedTask, area);
  };

  render() {
    const {
      area,
      cardIsActive,
      editorState,
      handleAddTask,
      isAgenda,
      isPrivate,
      task,
      styles,
      toggleMenuState
    } = this.props;
    const showTeam = area === USER_DASH;
    const {taskId, assignee, integration, tags, team} = task;
    const {teamId, teamName} = team;
    const {service} = integration || {};
    const isArchived = isTaskArchived(tags);
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
        <div className={css(styles.teamNameLabel)}>{teamName}</div> :
        (<button
          aria-label="Assign this task to a teammate"
          className={css(styles.avatarButton)}
          title={`Assigned to ${assignee.preferredName}`}
          type="button"
          ref={(c) => { this.assignRef = c; }}
        >
          <div className={avatarStyles}>
            <img
              alt={assignee.preferredName}
              className={css(styles.avatarImg)}
              src={assignee.picture || avatarUser}
              // hack because aphrodite loads styles on next tick, which causes the cell height adjuster to bork >:-(
              style={{height, width: height}}
            />
          </div>
          <div className={css(styles.avatarLabel)}>
            {assignee.preferredName}
          </div>
        </button>)
    );

    return (
      <div className={css(styles.footerAndMessage)}>
        <div className={css(styles.footer)}>
          <div className={css(styles.avatarBlock)}>
            {service || showTeam || isArchived ?
              ownerAvatarOrTeamName :
              <LoadableMenu
                LoadableComponent={LoadableAssignMenu}
                maxWidth={350}
                maxHeight={225}
                originAnchor={assignOriginAnchor}
                queryVars={{
                  area,
                  task,
                  teamId
                }}
                targetAnchor={assignTargetAnchor}
                toggle={ownerAvatarOrTeamName}
                toggleRef={this.assignRef}
                onOpen={toggleMenuState}
                onClose={toggleMenuState}
              />
            }
          </div>
          <div className={buttonBlockStyles}>
            {isArchived ?
              <OutcomeCardFooterButton onClick={this.removeContentTag('archived')} icon="reply" /> :
              <React.Fragment>
                {/* buttonSpacer helps truncated names (…) be consistent */}
                {!service ?
                  <LoadableMenu
                    LoadableComponent={LoadableGitHubMenu}
                    maxWidth={350}
                    maxHeight={225}
                    originAnchor={originAnchor}
                    queryVars={{
                      area,
                      handleAddTask,
                      taskId,
                      setError: this.setError,
                      clearError: this.clearError
                    }}
                    targetAnchor={targetAnchor}
                    toggle={<OutcomeCardFooterButton icon="github" setRef={(c) => { this.githubRef = c; }} />}
                    toggleRef={this.githubRef}
                    onOpen={toggleMenuState}
                    onClose={toggleMenuState}
                  /> :
                  <div className={css(styles.buttonSpacer)} />
                }
                <LoadableMenu
                  LoadableComponent={LoadableStatusMenu}
                  maxWidth={350}
                  maxHeight={225}
                  originAnchor={originAnchor}
                  queryVars={{
                    area,
                    editorState,
                    isAgenda,
                    isPrivate,
                    task,
                    removeContentTag: this.removeContentTag
                  }}
                  targetAnchor={targetAnchor}
                  toggle={<OutcomeCardFooterButton icon="ellipsis-v" setRef={(c) => { this.statusRef = c; }} />}
                  toggleRef={this.statusRef}
                  onOpen={toggleMenuState}
                  onClose={toggleMenuState}
                />
              </React.Fragment>
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
  handleAddTask: PropTypes.func,
  isAgenda: PropTypes.bool,
  isArchived: PropTypes.bool,
  isPrivate: PropTypes.bool,
  task: PropTypes.object,
  showTeam: PropTypes.bool,
  styles: PropTypes.object,
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

export default createFragmentContainer(
  withAtmosphere(
    withStyles(styleThunk)(OutcomeCardFooter)
  ),
  graphql`
    fragment OutcomeCardFooter_task on Task {
      taskId: id
      content
      assignee {
        ...on TeamMember {
          picture
        }
        preferredName
      }
      integration {
        service
      }
      tags
      team {
        teamId: id
        teamName: name
      }
      ...OutcomeCardAssignMenu_task
      ...OutcomeCardStatusMenu_task
    }`
);
