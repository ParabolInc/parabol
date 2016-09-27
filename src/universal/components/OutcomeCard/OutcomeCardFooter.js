import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';

const combineStyles = StyleSheet.combineStyles;
const avatarSize = '1.5rem';
const faStyle = {
  fontSize: ui.iconSize,
  lineHeight: avatarSize
};
const buttonShowFully = {
  backgroundColor: theme.palette.mid10l,
  color: theme.palette.dark
};
const actionButtonShowFully = {
  backgroundColor: theme.palette.light90g,
  color: theme.palette.dark
};
const buttonBase = {
  backgroundColor: 'transparent',
  border: 0,
  borderRadius: '.5rem',
  color: theme.palette.dark50l,
  cursor: 'pointer',
  fontSize: theme.typography.s3,
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
let styles = {};

const OutcomeCardFooter = (props) => {
  const {
    cardHasHover,
    hasOpenStatusMenu,
    isArchived,
    isProject,
    outcome,
    owner,
    showTeam,
    toggleAssignMenu,
    handleStatusClick
  } = props;
  let avatarBlockStyle = {};

  // BUTTONS
  // --------
  let buttonStyles = styles.buttonBase;
  const buttonOptions = [styles.buttonBase];

  // AVATAR
  // -------
  const avatarImage = owner.picture;
  const avatarName = showTeam ? outcome.team.name : owner.preferredName;
  // TODO: Set avatarTeam style when showing team instead of owner (on UserDashboard)
  // const avatarStyles = combineStyles(styles.avatar, styles.avatarTeam);
  const avatarStyles = styles.avatar;
  const menuHintStyle = cardHasHover ? faStyle : {visibility: 'hidden', ...faStyle};
  let buttonIcon = hasOpenStatusMenu ? 'times' : 'wrench';
  if (isArchived) buttonIcon = 'reply';

  if (!isProject) {
    buttonOptions.push(styles.actionButton);
  }

  if (hasOpenStatusMenu || cardHasHover) {
    if (isProject) {
      buttonOptions.push(styles.projectButtonShowFully);
    } else {
      buttonOptions.push(styles.actionButtonShowFully);
    }
  }

  if (isArchived) {
    buttonOptions.push(styles.projectButtonShowFully);
    avatarBlockStyle = {
      cursor: 'not-allowed',
      opacity: 1
    };
  }

  buttonStyles = combineStyles(...buttonOptions);

  return (
    <div className={styles.root}>
      <div className={styles.avatarLayout}>
        <div className={styles.avatarBlock} onClick={toggleAssignMenu} style={avatarBlockStyle}>
          {!showTeam &&
            <img
              alt={avatarName}
              className={avatarStyles}
              src={avatarImage}
            />
          }
          <div className={styles.name}>{avatarName}</div>
          {!isArchived &&
            <FontAwesome
              className={styles.menuHint}
              name="ellipsis-v"
              style={menuHintStyle}
            />
          }
        </div>
      </div>
      <div className={styles.buttonBlock}>
        <button className={buttonStyles} onClick={handleStatusClick}>
          <FontAwesome name={buttonIcon} style={faStyle}/>
        </button>
      </div>
    </div>
  );
};

OutcomeCardFooter.propTypes = {
  cardHasHover: PropTypes.bool,
  toggleAssignMenu: PropTypes.func,
  handleStatusClick: PropTypes.func,
  hasOpenStatusMenu: PropTypes.bool,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  owner: PropTypes.object,
  // project: PropTypes.shape({
  //   projectId: PropTypes.string
  // }),
  team: PropTypes.object
};

OutcomeCardFooter.defaultProps = {
  cardHasHover: false,
  status: labels.projectStatus.active.slug,
  toggleAssignMenu() {
    console.log('toggleAssignMenu');
  },
  handleStatusClick() {
    console.log('handleStatusClick');
  },
  hasOpenStatusMenu: false,
  isArchived: false,
  owner: {
    preferredName: 'Taya Mueller',
    picture: TayaAvatar
  }
};

styles = StyleSheet.create({
  root: {
    display: 'flex !important',
    padding: ui.cardPaddingBase
  },

  avatarLayout: {
    flex: 1,
    fontSize: 0,
  },

  avatarBlock: {
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: 0,

    ':hover': {
      opacity: '.65'
    },
    ':focus': {
      opacity: '.65'
    }
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
    color: theme.palette.dark,
    display: 'inline-block',
    fontSize: theme.typography.s2,
    fontWeight: 700,
    lineHeight: avatarSize,
    verticalAlign: 'middle'
  },

  menuHint: {
    color: theme.palette.dark,
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

export default look(OutcomeCardFooter);
