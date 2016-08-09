import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';

const combineStyles = StyleSheet.combineStyles;
const avatarSize = '1.5rem';
const buttonBase = {
  border: 0,
  borderRadius: '.5rem',
  cursor: 'pointer',
  fontSize: theme.typography.s3,
  fontWeight: 700,
  height: avatarSize,
  lineHeight: avatarSize,
  margin: 0,
  outline: 'none',
  padding: 0,
  textAlign: 'center',
  width: avatarSize
};
let styles = {};

const OutcomeCardFooter = (props) => {
  const {
    status,
    openStatusMenu,
    // hasOpenAssignMenu,
    hasOpenStatusMenu,
    isArchived,
    isProject,
    owner,
    showByTeam,
    team
  } = props;

  const makeStatusButton = () => {
    const buttonStyles = combineStyles(styles.statusButton, styles[status]);
    return (
      <button
        className={buttonStyles}
        onClick={openStatusMenu}
      >
        <FontAwesome
          name={labels.projectStatus[status].icon}
          style={{lineHeight: avatarSize}}
        />
      </button>
    );
  };

  const avatarImage = showByTeam ? team.picture : owner.picture;
  const avatarName = showByTeam ? team.preferredName : owner.preferredName;
  const avatarTeamStyles = combineStyles(styles.avatar, styles.avatarTeam);
  const avatarStyles = showByTeam ? avatarTeamStyles : styles.avatar;

  return (
    <div className={styles.root}>
      <div className={styles.avatarBlock}>
        <img alt={avatarName} className={avatarStyles} src={avatarImage} />
        <div className={styles.name}>{avatarName}</div>
      </div>
      <div className={styles.statusBlock}>
        {/* ugly, refactor */}
        {hasOpenStatusMenu ?
          <button className={styles.statusButton}>
            <FontAwesome
              name="times"
              style={{lineHeight: avatarSize}}
            />
          </button> :
          <div>
            {isProject ?
              <div className={styles.statusButton}>
              {makeStatusButton()}
              </div> :
              <button className={styles.actionButton}>
                <FontAwesome
                  name="calendar-check-o"
                  style={{lineHeight: avatarSize}}
                />
              </button>
            }
          </div>
        }
        {isArchived && <div style={{display: 'none'}}>TODO: Style archived</div>}
      </div>
    </div>
  );
};

OutcomeCardFooter.propTypes = {
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  openStatusMenu: PropTypes.func,
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  owner: PropTypes.object,
  team: PropTypes.object,
  showByTeam: PropTypes.bool
};

OutcomeCardFooter.defaultProps = {
  status: labels.projectStatus.active.slug,
  openStatusMenu() {
    console.log('openStatusMenu');
  },
  hasOpenAssignMenu: false,
  hasOpenStatusMenu: false,
  isArchived: false,
  isProject: true,
  owner: {
    preferredName: 'Taya Mueller',
    picture: TayaAvatar
  },
  team: {
    preferredName: 'Engineering',
    picture: 'https://placekitten.com/g/24/24'
  },
  showByTeam: false
};

styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${theme.palette.mid30l}`,
    display: 'flex !important',
    padding: '.5rem'
  },

  avatarBlock: {
    alignSelf: 'flex-start',
    flex: 1,
    fontSize: 0
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

  active: {
    color: theme.palette.cool
  },

  stuck: {
    color: theme.palette.warm
  },

  done: {
    color: theme.palette.dark10d
  },

  future: {
    color: theme.palette.mid
  }
});

export default look(OutcomeCardFooter);
