import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import Textarea from 'react-textarea-autosize';
import OutcomeCardFooter from './OutcomeCardFooter';
import OutcomeCardStatusMenu from './OutcomeCardStatusMenu';
import theme from 'universal/styles/theme';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';

const combineStyles = StyleSheet.combineStyles;
const descriptionFA = {
  backgroundColor: theme.palette.cool10l,
  borderTopColor: 'currentColor',
  color: theme.palette.cool,
  outline: 'none'
};
const descriptionActionFA = {
  backgroundColor: 'rgba(255, 255, 255, .85)',
  borderTopColor: theme.palette.mid,
  color: theme.palette.mid10d
};
let styles = {};

const OutcomeCard = (props) => {
  const {
    content,
    status,
    hasOpenAssignMenu,
    hasOpenStatusMenu,
    isArchived,
    isProject,
    timestamp
  } = props;

  let rootStyles;
  const rootStyleOptions = [styles.root, styles.cardBlock];
  const descStyles = isProject ? styles.content : combineStyles(styles.content, styles.descriptionAction);
  if (isProject) {
    rootStyleOptions.push(styles[status]);
  } else {
    rootStyleOptions.push(styles.isAction);
  }
  rootStyles = combineStyles.apply(null, rootStyleOptions);

  return (
    <div className={rootStyles}>
      {/* card main */}
      {hasOpenStatusMenu &&
        <OutcomeCardStatusMenu isArchived={isArchived} status={status} />
      }
      {!hasOpenAssignMenu && !hasOpenStatusMenu &&
        <div className={styles.body}>
          <div className={styles.timestamp}>
            {timestamp}
          </div>
          <Textarea className={descStyles} defaultValue={content} />
        </div>
      }
      {/* card footer */}
      <OutcomeCardFooter {...props} />
    </div>
  );
};

OutcomeCard.propTypes = {
  content: PropTypes.string,
  status: PropTypes.oneOf([
    'active',
    'stuck',
    'done',
    'future'
  ]),
  openStatusMenu: PropTypes.func,
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  owner: PropTypes.object,
  team: PropTypes.object,
  timestamp: PropTypes.string,
  showByTeam: PropTypes.bool
};

OutcomeCard.defaultProps = {
  content: 'Parabol website updated',
  status: 'active',
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
  timestamp: '1 day ago',
  showByTeam: false
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.5rem',
    borderTop: `.25rem solid ${theme.palette.mid}`,
    maxWidth: '20rem',
    width: '100%'
  },

  cardBlock: {
    marginBottom: '1rem',
    width: '100%'
  },

  body: {
    // TODO: set minHeight? (TA)
    width: '100%'
  },

  isAction: {
    backgroundColor: theme.palette.light50l
  },

  timestamp: {
    color: theme.palette.dark,
    fontSize: theme.typography.s1,
    fontWeight: 700,
    lineHeight: theme.typography.s3,
    padding: '.5rem',
    textAlign: 'right'
  },

  content: {
    backgroundColor: 'transparent',
    border: 0,
    borderTop: '1px solid transparent',
    color: theme.palette.dark10d,
    display: 'block',
    fontFamily: theme.typography.sansSerif,
    fontSize: theme.typography.s3,
    lineHeight: theme.typography.s4,
    // TODO: Clean up these comments (TA)
    // minHeight: '2.6875rem', // A
    // minHeight: '2.1875rem', // B
    minHeight: '3.3125rem', // Oversizing for menu (TA)
    padding: '.5rem .5rem 1rem', // A
    // padding: '.5rem', // B
    resize: 'none',
    width: '100%',

    ':focus': {
      ...descriptionFA
    },
    ':active': {
      ...descriptionFA
    }
  },

  descriptionAction: {
    // NOTE: modifies styles.content
    ':focus': {
      ...descriptionActionFA
    },
    ':active': {
      ...descriptionActionFA
    }
  },

  // Status theme colors

  active: {
    borderTopColor: theme.palette.cool
  },

  stuck: {
    borderTopColor: theme.palette.warm
  },

  done: {
    borderTopColor: theme.palette.dark10d
  },

  future: {
    borderTopColor: theme.palette.mid
  }
});

export default look(OutcomeCard);
