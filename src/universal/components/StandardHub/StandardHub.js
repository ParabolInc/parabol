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

export default function StandardHub(props) {
  const {picture, preferredName, email} = props;
  return (
    <div className={styles.root}>
      <img alt="Me" className={styles.avatar} src={picture}/>
      <div className={styles.info}>
        <div className={styles.name}>{preferredName}</div>
        <div className={styles.email}>{email}</div>
      </div>
      <div className={styles.settings}>
        <div className={styles.settingsIcon} title="My Settings">
          <Link to="/me/settings">
            <FontAwesome name="cog" style={faStyle}/>
          </Link>

        </div>
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
  }
});

StandardHub.propTypes = {
  email: PropTypes.string,
  picture: PropTypes.string,
  preferredName: PropTypes.string
};

export default look(StandardHub);

