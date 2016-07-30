import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';

let styles = {};
const faStyle = {
  lineHeight: 'inherit',
  color: 'white'
};

export default function SettingsHub() {
  return (
    <div className={styles.root}>
      <Link
        className={styles.link}
        title="Sign Out"
        to="/logout"
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
      </Link>
      <div className={styles.closeIcon} title="My Settings">
        <Link to="/me">
          <FontAwesome
            name="times-circle"
            style={faStyle}
            title="Close My Settings"
          />
        </Link>
      </div>
    </div>
  );
};

styles = StyleSheet.create({
  root: {
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    display: 'flex !important',
    minHeight: '4.875rem',
    padding: '1rem 0 1rem 1rem',
    width: '100%'
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

export default look(SettingsHub);

