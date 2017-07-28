import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import isProjectArchived from 'universal/utils/isProjectArchived';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';
import OutcomeCardAssignMenu from '../OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from '../OutcomeCardStatusMenu/OutcomeCardStatusMenu';
import AsyncMenuContainer from 'universal/modules/menu/containers/AsyncMenu/AsyncMenu';

const fetchMenu = () => System.import('universal/containers/GitHubReposMenuRoot/GitHubReposMenuRoot');

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const OutcomeCardFooter = (props) => {
  const {
    cardHasFocus,
    cardHasHover,
    editorState,
    isAgenda,
    isPrivate,
    outcome,
    setIntegrationStyles,
    showTeam,
    styles,
    teamMembers,
    unarchiveProject
  } = props;
  const {teamMember: owner} = outcome;
  const isArchived = isProjectArchived(outcome.tags);

  const buttonBlockStyles = css(
    styles.buttonBlock,
    cardHasFocus && styles.showBlock,
    cardHasHover && styles.showBlock
  );

  return (
    <div className={css(styles.root)}>
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
          <OutcomeCardFooterButton onClick={unarchiveProject} icon="reply" /> :
          <div>
            <AsyncMenuContainer
              fetchMenu={fetchMenu}
              maxWidth={350}
              maxHeight={150}
              originAnchor={originAnchor}
              queryVars={{projectId: outcome.id}}
              targetAnchor={targetAnchor}
              toggle={<OutcomeCardFooterButton icon="github" />}
            />
            <OutcomeCardStatusMenu
              editorState={editorState}
              isAgenda={isAgenda}
              outcome={outcome}
            />
          </div>
        }
      </div>
    </div>
  );
};

OutcomeCardFooter.propTypes = {
  cardHasFocus: PropTypes.bool,
  cardHasHover: PropTypes.bool,
  editorState: PropTypes.object,
  isAgenda: PropTypes.bool,
  isArchived: PropTypes.bool,
  isPrivate: PropTypes.bool,
  outcome: PropTypes.object,
  setIntegrationStyles: PropTypes.func,
  showTeam: PropTypes.bool,
  styles: PropTypes.object,
  teamMembers: PropTypes.array,
  unarchiveProject: PropTypes.func.isRequired
};

const styleThunk = () => ({
  root: {
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
