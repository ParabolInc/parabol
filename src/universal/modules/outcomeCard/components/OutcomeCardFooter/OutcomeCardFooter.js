import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const avatarSize = '1.5rem';
const faStyle = {
  fontSize: ui.iconSize,
  lineHeight: avatarSize
};
const OutcomeCardFooter = (props) => {
  const {
    cardHasHover,
    hasOpenStatusMenu,
    outcome,
    showTeam,
    styles,
    toggleAssignMenu,
    toggleStatusMenu,
    unarchiveProject
  } = props;
  const {isArchived, teamMember: owner} = outcome;
  const isProject = Boolean(outcome.status);
  // AVATAR
  // -------
  const avatarImage = owner.picture;
  const avatarName = showTeam ? outcome.team.name : owner.preferredName;
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
    !isProject && styles.actionButton,
    showFully && (isProject ? styles.projectButtonShowFully : styles.actionButtonShowFully)
  );
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.avatarLayout)}>
        <button disabled={isArchived} className={avatarBlockStyle} onClick={!isArchived && !showTeam && toggleAssignMenu}>
          {!showTeam &&
            <img
              alt={avatarName}
              className={css(styles.avatar)}
              src={avatarImage}
            />
          }
          <div className={css(styles.name)}>{avatarName}</div>
          {!isArchived && !showTeam &&
            <FontAwesome
              className={css(styles.menuHint)}
              name="ellipsis-v"
              style={menuHintStyle}
            />
          }
        </button>
      </div>
      <div className={css(styles.buttonBlock)}>
        <button className={buttonStyles} onClick={isArchived ? unarchiveProject : toggleStatusMenu}>
          <FontAwesome name={buttonIcon} style={faStyle} />
        </button>
      </div>
    </div>
  );
};


OutcomeCardFooter.propTypes = {
  cardHasHover: PropTypes.bool,
  toggleAssignMenu: PropTypes.func,
  toggleStatusMenu: PropTypes.func,
  hasOpenStatusMenu: PropTypes.bool,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  outcome: PropTypes.object,
  owner: PropTypes.object,
  showTeam: PropTypes.bool,
  styles: PropTypes.object,
  team: PropTypes.object,
  unarchiveProject: PropTypes.func.isRequired
};
const buttonShowFully = {
  backgroundColor: appTheme.palette.mid10l,
  color: appTheme.palette.dark
};
const actionButtonShowFully = {
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
    fontSize: 0,
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

  name: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: avatarSize,
    verticalAlign: 'middle'
  },

  menuHint: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    marginLeft: '.375rem',
    verticalAlign: 'middle'
  },

  buttonBlock: {
    // Define
  },

  buttonBase: {
    ...buttonBase
  },

  projectButtonShowFully: {
    ...buttonBase,
    ...buttonShowFully
  },

  actionButton: {
    ...buttonBase,

    ':focus': {
      ...actionButtonShowFully
    }
  },

  actionButtonShowFully: {
    ...actionButtonShowFully
  }
});

export default withStyles(styleThunk)(OutcomeCardFooter);
