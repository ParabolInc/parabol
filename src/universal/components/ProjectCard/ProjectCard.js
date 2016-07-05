import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';

const combineStyles = StyleSheet.combineStyles;
const avatarSize = '1.5rem';
let styles = {};

const ProjectCard = props => {
  const {
    description,
    status,
    openStatusMenu,
    isArchived,
    owner,
    showByOwner,
    team,
    timestamp
  } = props;

  const makeStatusButton = () => {
    const buttonStyles = combineStyles(styles.statusButton, styles[status]);
    let icon;
    /*  */ if (status === 'active') {
      icon = 'arrow-right';
    } else if (status === 'stuck') {
      icon = 'exclamation-triangle';
    } else if (status === 'done') {
      icon = 'check';
    } else if (status === 'future') {
      icon = 'clock-o';
    }
    return (
      <button
        className={buttonStyles}
        onClick={openStatusMenu}
      >
        <FontAwesome name={icon} style={{lineHeight: avatarSize}} />
      </button>
    );
  };

  return (
    <div className={combineStyles(styles.root, styles[status])}>
      {/* card main */}
      <div className={styles.main}>
        <div className={styles.timestamp}>
          {timestamp}
        </div>
        <div className={styles.description}>
          {description}
        </div>
      </div>
      {/* card footer */}
      <div className={styles.footer}>
        {showByOwner &&
          <div className={styles.avatarBlock}>
            <img alt={owner.name} className={styles.avatar} src={owner.avatar} />
            <div className={styles.name}>{owner.name}</div>
          </div>
        }
        {!showByOwner &&
          <div className={styles.avatarBlock}>
            <img alt={team.name} className={styles.avatar} src={team.avatar} />
            <div className={styles.name}>{team.name}</div>
          </div>
        }
        <div className={styles.statusBlock}>
          <div className={styles.statusButton}>
            {makeStatusButton()}
          </div>
          {isArchived &&
            <div>Archived</div>
          }
        </div>
      </div>
    </div>
  );
};

ProjectCard.propTypes = {
  description: PropTypes.string,
  status: PropTypes.oneOf([
    'active',
    'stuck',
    'done',
    'future'
  ]),
  openStatusMenu: PropTypes.func,
  isArchived: PropTypes.bool,
  owner: PropTypes.object,
  team: PropTypes.object,
  timestamp: PropTypes.string,
  showByOwner: PropTypes.bool
};

ProjectCard.defaultProps = {
  description: 'Parabol website updated',
  status: 'done',
  openStatusMenu() {
    console.log('openStatusMenu');
  },
  isArchived: false,
  owner: {
    name: 'Taya Mueller',
    avatar: TayaAvatar
  },
  team: {
    name: 'Engineering',
    avatar: 'https://placekitten.com/g/24/24'
  },
  timestamp: '1 day ago',
  showByOwner: true
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.5rem',
    borderTop: `.25rem solid ${theme.palette.dark10d}`,
    maxWidth: '20rem'
  },

  main: {
    padding: '.5rem'
  },

  timestamp: {
    color: theme.palette.dark,
    fontSize: theme.typography.s1,
    fontWeight: 700,
    textAlign: 'right'
  },

  description: {
    color: theme.palette.dark10d,
    fontSize: theme.typography.s3
  },

  footer: {
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
    color: theme.palette.mid,
    display: 'inline-block',
    fontSize: theme.typography.s2,
    fontWeight: 700,
    lineHeight: avatarSize,
    verticalAlign: 'top'
  },

  statusBlock: {
    alignSelf: 'flex-end'
  },

  active: {
    borderTopColor: theme.palette.dark10d,
    color: theme.palette.dark10d
  },

  stuck: {
    borderTopColor: theme.palette.warm,
    color: theme.palette.warm
  },

  done: {
    borderTopColor: theme.palette.cool,
    color: theme.palette.cool
  },

  future: {
    borderTopColor: theme.palette.mid,
    color: theme.palette.mid
  },

  statusButton: {
    backgroundColor: theme.palette.mid10l,
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
  }
});

export default look(ProjectCard);
