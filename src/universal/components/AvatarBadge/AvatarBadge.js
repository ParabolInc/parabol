import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import {srOnly} from 'universal/styles/helpers';

const checkInStatus = {
  null: {
    icon: 'circle',
    statusName: ''
  },
  true: {
    icon: 'check-circle',
    statusName: ' & present'
  },
  false: {
    icon: 'minus-circle',
    statusName: ' & absent'
  }
};

const AvatarBadge = (props) => {
  const {isCheckedIn = null, isConnected, styles} = props;
  const connection = isConnected ? 'online' : 'offline';
  const checkIn = isCheckedIn ? 'present' : 'absent';
  const iconStyles = css(
    styles.badgeIcon,
    styles[connection]
  );
  const {icon, statusName} = checkInStatus[isCheckedIn];
  const title = `${isConnected ? 'Online' : 'Offline'}${statusName}`;
  const description = `${connection}, ${checkIn}`;
  return (
    <div className={css(styles.badge)}>
      <FontAwesome className={iconStyles} name={icon} title={title} />
      <span className={css(styles.srOnly)}>
        {description}
      </span>
    </div>
  );
};

AvatarBadge.propTypes = {
  isCheckedIn: PropTypes.bool,
  isConnected: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  badge: {
    display: 'block',
    fontSize: '.875rem',
    height: '.875rem',
    lineHeight: '.875rem',
    textAlign: 'center',

    '::before': {
      backgroundColor: '#fff',
      borderRadius: '100%',
      content: '""',
      height: '.75rem',
      position: 'absolute',
      right: '1px',
      top: '1px',
      width: '.75rem',
      zIndex: 300
    },

    '::after': {
      backgroundColor: 'rgba(255, 255, 255, .65)',
      borderRadius: '100%',
      content: '""',
      height: '1em',
      position: 'absolute',
      right: 0,
      top: 0,
      width: '1em',
      zIndex: 200
    }
  },

  badgeIcon: {
    height: '1em',
    lineHeight: '1em',
    position: 'relative',
    width: '1em',
    zIndex: 400
  },

  offline: {
    color: appTheme.palette.dark50l
  },

  online: {
    color: appTheme.brand.secondary.green // TODO: theme-able?
  },

  srOnly: {
    ...srOnly
  }
});

export default withStyles(styleThunk)(AvatarBadge);
