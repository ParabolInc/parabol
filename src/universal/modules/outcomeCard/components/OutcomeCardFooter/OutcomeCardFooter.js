import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import isProjectArchived from 'universal/utils/isProjectArchived';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';
import OutcomeCardAssignMenu from '../OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from '../OutcomeCardStatusMenu/OutcomeCardStatusMenu';
import OutcomeCardGitHubMenu from '../OutcomeCardGitHubMenu/OutcomeCardGitHubMenu';
import GitHubReposMenuRoot from 'universal/containers/GitHubReposMenuRoot/GitHubReposMenuRoot';
import MakeGitHubProjectButton from 'universal/components/MakeGitHubProjectButton';

const avatarSize = '1.5rem';
const faStyle = {
  fontSize: ui.iconSize,
  lineHeight: avatarSize
};
const OutcomeCardFooter = (props) => {
  const {
    cardHasFocus,
    cardHasHover,
    editorState,
    hasOpenStatusMenu,
    isAgenda,
    isPrivate,
    outcome,
    setIntegrationStyles,
    showTeam,
    styles,
    teamMembers,
    toggleAssignMenu,
    toggleStatusMenu,
    unarchiveProject
  } = props;
  const {teamMember: owner} = outcome;
  console.log(outcome);
  const isArchived = isProjectArchived(outcome.tags);
  // AVATAR
  // -------
  const avatarImage = owner.picture;
  const avatarName = showTeam ? outcome.team.name : owner.preferredName;
  const teamName = outcome.team.name;
  // TODO: Set avatarTeam style when showing team instead of owner (on UserDashboard)
  const menuHintStyle = cardHasHover ? faStyle : {visibility: 'hidden', ...faStyle};
  let buttonIcon = hasOpenStatusMenu ? 'times' : 'wrench';
  if (isArchived) buttonIcon = 'reply';
  const showFully = (hasOpenStatusMenu || cardHasHover || isArchived);

  const avatarBlockStyle = css(
    styles.avatarBlock,
    isArchived && styles.avatarBlockArchived,
    showTeam && styles.avatarBlockShowTeam
  );
  const buttonStyles = css(
    styles.buttonBase,
    isPrivate && styles.privateButton,
    showFully && (isPrivate ? styles.privateButtonShowFully : styles.projectButtonShowFully)
  );

  const buttonBlockStyles = css(
    styles.buttonBlock,
    cardHasFocus && styles.showBlock,
    cardHasHover && styles.showBlock
  );

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.avatarLayout)}>
        <OutcomeCardAssignMenu
          cardHasHover={cardHasHover}
          cardHasFocus={cardHasFocus}
          outcome={outcome}
          owner={owner}
          team={teamName}
          teamMembers={teamMembers}
        />
      </div>
      <div className={buttonBlockStyles}>
        {isArchived ?
          <OutcomeCardFooterButton onClick={unarchiveProject} icon="reply" /> :
          <div>
            <MakeGitHubProjectButton
              projectId={outcome.id}
              teamId={outcome.team.id}
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

// <button disabled={isArchived} className={avatarBlockStyle} onClick={!isArchived && !showTeam && toggleAssignMenu}>
//   {!showTeam &&
//     <img
//       alt={avatarName}
//       className={css(styles.avatar)}
//       src={avatarImage}
//     />
//   }
//   <div className={css(styles.name)}>{avatarName}</div>
//   {!isArchived && !showTeam &&
//     <FontAwesome
//       className={css(styles.menuHint)}
//       name="ellipsis-v"
//       style={menuHintStyle}
//     />
//   }
// </button>

OutcomeCardFooter.propTypes = {
  cardHasFocus: PropTypes.bool,
  cardHasHover: PropTypes.bool,
  editorState: PropTypes.object,
  toggleAssignMenu: PropTypes.func,
  toggleStatusMenu: PropTypes.func,
  hasOpenStatusMenu: PropTypes.bool,
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
const buttonShowFully = {
  backgroundColor: appTheme.palette.mid10l,
  color: appTheme.palette.dark
};

const privateButtonShowFully = {
  backgroundColor: appTheme.palette.light90g,
  color: appTheme.palette.dark
};

const buttonBase = {
  backgroundColor: 'transparent',
  border: 0,
  borderRadius: '.5rem',
  color: appTheme.palette.dark50l,
  cursor: 'pointer',
  fontSize: appTheme.typography.s3,
  fontWeight: 700,
  height: avatarSize,
  lineHeight: avatarSize,
  margin: 0,
  outline: 'none',
  padding: 0,
  textAlign: 'center',
  width: avatarSize,

  ':hover': {
    opacity: '.65'
  },
  ':focus': {
    ...buttonShowFully
  }
};

const styleThunk = () => ({
  root: {
    display: 'flex !important',
    padding: ui.cardPaddingBase
  },

  avatarLayout: {
    flex: 1,
    fontSize: 0
  },

  avatarBlock: {
    background: 'transparent',
    border: 0,
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: appTheme.typography.sansSerif,
    fontSize: 0,
    outline: 'none',
    padding: 0,

    ':hover': {
      opacity: '.65'
    },
    ':focus': {
      opacity: '.65'
    }
  },

  avatarBlockArchived: {
    cursor: 'not-allowed',
    opacity: '1 !important'
  },

  avatarBlockShowTeam: {
    cursor: 'default',
    opacity: '1 !important'
  },

  avatar: {
    borderRadius: avatarSize,
    boxShadow: '0 0 1px 1px rgba(0, 0, 0, .2)',
    display: 'inline-block',
    height: avatarSize,
    marginRight: '.375rem',
    verticalAlign: 'top',
    width: avatarSize
  },

  avatarTeam: {
    borderRadius: '.125rem'
  },

  // name: {
  //   color: appTheme.palette.dark,
  //   display: 'inline-block',
  //   fontSize: appTheme.typography.s2,
  //   fontWeight: 700,
  //   lineHeight: avatarSize,
  //   verticalAlign: 'middle'
  // },

  menuHint: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    marginLeft: '.375rem',
    verticalAlign: 'middle'
  },

  buttonBlock: {
    opacity: 0
  },

  buttonBase: {
    ...buttonBase
  },

  projectButtonShowFully: {
    ...buttonBase,
    ...buttonShowFully
  },

  privateButton: {
    ...buttonBase,

    ':focus': {
      ...privateButtonShowFully
    }
  },

  privateButtonShowFully: {
    ...privateButtonShowFully
  },

  showBlock: {
    opacity: 1
  }
});

export default withStyles(styleThunk)(OutcomeCardFooter);
