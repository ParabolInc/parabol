import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {push} from 'react-router-redux';
import theme from 'universal/styles/theme';
import FontAwesome from 'react-fontawesome';

let styles = {};
const faStyle = {
  lineHeight: 'inherit'
};

const UserHub = (props) => {
  const {email, profile: {preferredName}} = props.user;
  const avatar = props.user.avatar || 'https://placekitten.com/g/44/44';

  const onSettingsClick = (event) => {
    const {dispatch} = props;
    event.preventDefault();
    dispatch(push('/me/settings'));
  };

  const onCloseSettingsClick = (event) => {
    const {dispatch} = props;
    event.preventDefault();
    dispatch(push('/me'));
  };

  const onSignOutClick = (event) => {
    const {dispatch} = props;
    event.preventDefault();
    dispatch(push('/logout'));
  };

  return (
    <div>
      {props.activeArea !== 'settings' ?
        <div className={styles.root}>
          <img alt="Me" className={styles.avatar} src={avatar} />
          <div className={styles.info}>
            <div className={styles.name}>{preferredName}</div>
            <div className={styles.email}>{email}</div>
          </div>
          <div className={styles.settings}>
            <div className={styles.settingsIcon} title="My Preferences">
              <FontAwesome
                name="cog"
                onClick={(e) => onSettingsClick(e)}
                style={faStyle}
              />
            </div>
          </div>
        </div> :
        <div className={styles.root}>
          <a
            className={styles.link}
            href="#"
            onClick={(e) => onSignOutClick(e)}
            title="Sign Out"
          >
            <div className={styles.linkIcon}>
              <FontAwesome
                name="sign-out"
                style={faStyle}
              />
            </div>
            <div className={styles.linkLabel}>
              Sign Out
            </div>
          </a>
          <div className={styles.closeIcon} title="My Preferences">
            <FontAwesome
              name="times-circle"
              onClick={(e) => onCloseSettingsClick(e)}
              style={faStyle}
              title="Close My Preferences"
            />
          </div>
        </div>
      }
    </div>
  );
};

UserHub.propTypes = {
  activeArea: PropTypes.oneOf([
    'outcomes',
    'settings',
    'team'
  ]).isRequired,
  dispatch: PropTypes.func.isRequired,
  user: PropTypes.object
};

styles = StyleSheet.create({
  root: {
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    display: 'flex !important',
    minHeight: '4.875rem',
    padding: '1rem 0 1rem 1rem',
    width: '100%'
  },

  avatar: {
    borderRadius: '100%',
    height: '2.75rem',
    width: '2.75rem'
  },

  info: {
    alignItems: 'flex-start',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: '1rem'
  },

  name: {
    fontSize: theme.typography.sBase,
    fontWeight: 700,
    lineHeight: '1.375rem',
    maxWidth: '132px',
    overflow: 'hidden',
    paddingTop: '.125rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  email: {
    fontSize: theme.typography.s2,
    lineHeight: theme.typography.sBase,
    marginTop: '.125rem'
  },

  settings: {
    alignItems: 'center',
    fontSize: theme.typography.s3,
    display: 'flex',
    justifyContent: 'center',
    minWidth: '2rem',
    width: '2rem'
  },

  settingsIcon: {
    cursor: 'pointer',
    fontSize: '14px',
    height: '14px',
    lineHeight: '14px',
    textAlign: 'center',
    width: '14px',

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    }
  },

  link: {
    color: 'inherit',
    cursor: 'pointer',
    display: 'block',
    flex: 1,
    fontSize: 0,
    height: '2.75rem',
    lineHeight: '2.75rem',
    marginRight: '3.5rem',
    paddingLeft: '2.375rem',

    ':hover': {
      color: 'inherit',
      opacity: '.5'
    },
    ':focus': {
      color: 'inherit',
      opacity: '.5'
    }
  },

  linkIcon: {
    display: 'inline-block',
    fontSize: theme.typography.s3,
    marginRight: '.5rem',
    verticalAlign: 'middle',
    width: theme.typography.s3,
  },

  linkLabel: {
    display: 'inline-block',
    fontSize: theme.typography.s3,
    fontWeight: 700,
    verticalAlign: 'middle'
  },

  closeIcon: {
    cursor: 'pointer',
    fontSize: theme.typography.s3,
    height: '2.75rem',
    lineHeight: '2.75rem',
    textAlign: 'center',
    width: '2rem',

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    }
  }
});

export default look(UserHub);
