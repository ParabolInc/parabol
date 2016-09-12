import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';

const combineStyles = StyleSheet.combineStyles;
const avatarSize = '1.5rem';
const buttonBase = {
  border: 0,
  borderRadius: '.5rem',
  color: theme.palette.mid,
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
  }
};
let styles = {};

const OutcomeCardFooter = (props) => {
  const {
    hasOpenStatusMenu,
    owner,
    status,
    toggleAssignMenu,
    toggleStatusMenu,
    isArchived,
  } = props;

  const statusButtonStyles = hasOpenStatusMenu ?
    styles.statusButton :
    combineStyles(styles.statusButton, styles[status]);
  const avatarImage = owner.picture;
  const avatarName = owner.preferredName;
  // const avatarStyles = combineStyles(styles.avatar, styles.avatarTeam);
  // TODO: Set avatarTeam style when showing team instead of owner (on UserDashboard)
  const avatarStyles = styles.avatar;
  const buttonIcon = labels.projectStatus[status].icon;

  return (
    <div className={styles.root}>
      <div className={styles.avatarBlock} onClick={toggleAssignMenu}>
        <img
          alt={avatarName}
          className={avatarStyles}
          src={avatarImage}
        />
        <div className={styles.name}>{avatarName}</div>
      </div>
      <div className={styles.statusBlock}>
        <button className={statusButtonStyles} onClick={toggleStatusMenu}>
          {hasOpenStatusMenu ?
            <FontAwesome name="times" style={{lineHeight: avatarSize}}/> :
            <FontAwesome name={buttonIcon} style={{lineHeight: avatarSize}}/>
          }
        </button>
        {isArchived && <div style={{display: 'none'}}>TODO: Style archived</div>}
      </div>
    </div>
  );
};

OutcomeCardFooter.propTypes = {
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  toggleAssignMenu: PropTypes.func,
  toggleStatusMenu: PropTypes.func,
  hasOpenStatusMenu: PropTypes.bool,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  owner: PropTypes.object,
  team: PropTypes.object,
};

OutcomeCardFooter.defaultProps = {
  status: labels.projectStatus.active.slug,
  toggleAssignMenu() {
    console.log('toggleAssignMenu');
  },
  toggleStatusMenu() {
    console.log('toggleStatusMenu');
  },
  hasOpenStatusMenu: false,
  isArchived: false,
  owner: {
    preferredName: 'Taya Mueller',
    picture: TayaAvatar
  },
};

styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${theme.palette.mid30l}`,
    display: 'flex !important',
    padding: '.5rem'
  },

  avatarBlock: {
    alignSelf: 'flex-start',
    cursor: 'pointer',
    flex: 1,
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
    verticalAlign: 'top'
  },

  statusBlock: {
    alignSelf: 'flex-end'
  },

  statusButton: {
    ...buttonBase,
    backgroundColor: theme.palette.mid10l,

    ':focus': {
      boxShadow: '0 0 2px 2px rgba(9, 141, 143, .5)'
    }
  },

  actionButton: {
    ...buttonBase,
    backgroundColor: 'transparent',
    boxShadow: `inset 0 0 0 1px ${theme.palette.mid30l}`,

    ':focus': {
      boxShadow: `inset 0 0 0 1px ${theme.palette.mid30l}, 0 0 2px 2px rgba(103, 108, 138, .5)`
    }
  },

  // Status theme colors

  ...projectStatusStyles('color')
});

export default look(OutcomeCardFooter);


// FOR ACTIONS
// {/*<button className={styles.actionButton}>*/}
//   {/*<FontAwesome*/}
//     {/*name="calendar-check-o"*/}
//     {/*style={{lineHeight: avatarSize}}*/}
//   {/*/>*/}
// {/*</button>*/}
