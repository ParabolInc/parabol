import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import {convertToRaw} from 'draft-js';
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
    const {editorState, outcome: {id, content}} = this.props;
    const eqFn = (data) => data.value === tagValue;
    const nextContentState = removeAllRangesForEntity(editorState, content, 'TAG', eqFn);
    const options = {
      ops: {},
      variables: {
        updatedProject: {
          id,
          content: JSON.stringify(convertToRaw(nextContentState))
        }
      }
    };
    cashay.mutate('updateProject', options);
  };

  render() {
    const {
      cardHasFocus,
      cardHasHover,
      editorState,
      isAgenda,
      isPrivate,
      outcome,
      styles,
      teamMembers
    } = this.props;
    const {teamMember: owner, integration} = outcome;
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
    const ownerAvatar = (
      <div className={avatarStyles} tabIndex="0">
        <img
          alt={owner.preferredName}
          className={css(styles.avatarImg)}
          src={owner.picture}
        />
      </div>
    );

    return (
      <div className={css(styles.footerAndMessage)}>
        <div className={css(styles.footer)}>
          <div className={css(styles.avatarBlock)}>
            {service ?
              ownerAvatar :
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
                toggle={ownerAvatar}
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
                    projectId: outcome.id,
                    setError: this.setError,
                    clearError: this.clearError
                  }}
                  targetAnchor={targetAnchor}
                  toggle={<OutcomeCardFooterButton icon="github" />}
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
  cardHasFocus: PropTypes.bool,
  cardHasHover: PropTypes.bool,
  editorState: PropTypes.object,
  isAgenda: PropTypes.bool,
  isArchived: PropTypes.bool,
  isPrivate: PropTypes.bool,
  outcome: PropTypes.object,
  showTeam: PropTypes.bool,
  styles: PropTypes.object,
  teamMembers: PropTypes.array
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

  showBlock: {
    opacity: 1
  }
});

export default withStyles(styleThunk)(OutcomeCardFooter);
