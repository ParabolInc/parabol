import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import AsyncMenuContainer from 'universal/modules/menu/containers/AsyncMenu/AsyncMenu';
import OutcomeCardMessage from 'universal/modules/outcomeCard/components/OutcomeCardMessage/OutcomeCardMessage';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import isProjectArchived from 'universal/utils/isProjectArchived';
import OutcomeCardAssignMenu from '../OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';
import {convertToRaw} from 'draft-js';
import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity';
import {cashay} from 'cashay';
import {clearError, setError} from 'universal/utils/relay/mutationCallbacks';

const fetchGitHubRepos = () => System.import('universal/containers/GitHubReposMenuRoot/GitHubReposMenuRoot');
const fetchStatusMenu = () => System.import('universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu');

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
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

    const {error} = this.state;
    return (
      <div className={css(styles.footerAndMessage)}>
        <div className={css(styles.footer)}>
          <div className={css(styles.avatarBlock)}>
            <OutcomeCardAssignMenu
              cardHasHover={cardHasHover}
              cardHasFocus={cardHasFocus}
              outcome={outcome}
              owner={owner}
              teamMembers={teamMembers}
            />
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
  footer: {
    display: 'flex',
    height: '2.5rem',
    padding: ui.cardPaddingBase
  },

  avatarBlock: {
    flex: 1
  },

  buttonBlock: {
    opacity: 0
  },

  showBlock: {
    opacity: 1
  }
});

export default withStyles(styleThunk)(OutcomeCardFooter);
