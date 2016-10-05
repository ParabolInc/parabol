import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';
import Avatar from 'universal/components/Avatar/Avatar';

const faStyle = {
  lineHeight: 'inherit',
  color: 'white'
};

const StandardHub = (props) => {
  const {picture, preferredName, email, styles} = props;
  return (
    <div className={css(styles.root)}>
      <Avatar hasBadge={false} picture={picture} size="small"/>
      <div className={css(styles.info)}>
        <div className={css(styles.name)}>{preferredName}</div>
        <div className={css(styles.email)}>{email}</div>
      </div>
      <div className={css(styles.settings)}>
        <div className={css(styles.settingsIcon)} title="My Settings">
          <Link to="/me/settings">
            <FontAwesome name="cog" style={faStyle}/>
          </Link>
        </div>
      </div>
    </div>
  );
};

StandardHub.propTypes = {
  email: PropTypes.string,
  picture: PropTypes.string,
  preferredName: PropTypes.string,
  styles: PropTypes.object
};

const maxWidth = '8.25rem';
const styleThunk = () => ({
  root: {
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    display: 'flex !important',
    minHeight: '4.875rem',
    padding: '1rem 0 1rem 1rem',
    width: '100%'
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
    ...textOverflow,
    fontSize: appTheme.typography.sBase,
    fontWeight: 700,
    lineHeight: '1.375rem',
    maxWidth,
    paddingTop: '.125rem'
  },

  email: {
    ...textOverflow,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.sBase,
    marginTop: '.125rem',
    maxWidth
  },

  settings: {
    alignItems: 'center',
    fontSize: appTheme.typography.s3,
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

export default withStyles(styleThunk)(StandardHub);
