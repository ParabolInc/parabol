import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import {reduxForm, Field as ReduxFormField} from 'redux-form';
import OutcomeCardStatusMenu from './OutcomeCardStatusMenu';
import theme from 'universal/styles/theme';
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

const OutcomeCard = props => {
  const {
    content,
    status,
    openStatusMenu,
    hasOpenAssignMenu,
    hasOpenStatusMenu,
    isArchived,
    isProject,
    owner,
    showByTeam,
    team,
    timestamp
  } = props;

  const makeStatusButton = () => {
    const buttonStyles = combineStyles(styles.statusButton, styles[status]);
    const statusIcon = {
      active: 'arrow-right',
      stuck: 'exclamation-triangle',
      done: 'check',
      future: 'clock-o'
    };
    return (
      <button
        className={buttonStyles}
        onClick={openStatusMenu}
      >
        <FontAwesome
          name={statusIcon[status]}
          style={{lineHeight: avatarSize}}
        />
      </button>
    );
  };

  let rootStyles;
  const rootStyleOptions = [styles.root, styles.cardBlock];
  const avatarImage = showByTeam ? team.picture : owner.picture;
  const avatarName = showByTeam ? team.preferredName : owner.preferredName;
  const avatarTeamStyles = combineStyles(styles.avatar, styles.avatarTeam);
  const avatarStyles = showByTeam ? avatarTeamStyles : styles.avatar;
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
      <OutcomeCardStatusMenu isArchived={isArchived} status={status}/>
      }
      {!hasOpenAssignMenu && !hasOpenStatusMenu &&
      <div className={styles.body}>
        <div className={styles.timestamp}>
          {timestamp}
        </div>
        {/*<ReduxFormField*/}
          {/*name={name}*/}
          {/*component="textarea"*/}
          {/*className={descStyles}*/}
          {/*placeholder="A brief description..."*/}
          {/*{...props}*/}
        {/*/>*/}
      </div>
      }
      {/* card footer */}
      <div className={styles.footer}>
        <div className={styles.avatarBlock}>
          <img alt={avatarName} className={avatarStyles} src={avatarImage}/>
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

  // Status theme decorators
  // Note: Can share color properties

  active: {
    borderTopColor: theme.palette.cool,
    color: theme.palette.cool
  },

  stuck: {
    borderTopColor: theme.palette.warm,
    color: theme.palette.warm
  },

  done: {
    borderTopColor: theme.palette.dark10d,
    color: theme.palette.dark10d
  },

  future: {
    borderTopColor: theme.palette.mid,
    color: theme.palette.mid
  }
});

const formOptions = {form: 'outcomeCard'};
export default reduxForm(formOptions)(look(OutcomeCard));
