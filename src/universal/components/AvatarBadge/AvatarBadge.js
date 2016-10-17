import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import {srOnly} from 'universal/styles/helpers';

const getCheckedInIcon = (isCheckedIn) => {
  if (isCheckedIn) return 'check-circle';
  if (isCheckedIn === false) return 'times-circle';
  return 'circle';
};

const AvatarBadge = (props) => {
  const {isCheckedIn, isConnected, size, styles} = props;
  const connection = isConnected ? 'online' : 'offline';
  const checkIn = isCheckedIn ? 'present' : 'absent';
  const iconStyles = css(
    styles.badgeIcon,
    styles[connection]
  );
  const icon = getCheckedInIcon(isCheckedIn);
  const largeBadgeClass = size === 'large' || size === 'larger' || size === 'largest';
  const badgeStyles = css(
    styles.badge,
    largeBadgeClass && styles.badgeLarge
  );
  const description = `${connection}, ${checkIn}`;
  return (
    <div className={badgeStyles}>
      <FontAwesome className={iconStyles} name={icon}/>
      <span className={css(styles.srOnly)}>
        {description}
      </span>
    </div>
  );
};

AvatarBadge.propTypes = {
  isCheckedIn: PropTypes.bool,
  isConnected: PropTypes.bool,
  size: PropTypes.string,
  styles: PropTypes.object,
};
const styleThunk = () => ({
  badge: {
    display: 'block',
    fontSize: '.875rem',
    height: '.875rem',
    lineHeight: '.875rem',
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 0,

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

  // NOTE: Modifies badge
  badgeLarge: {
    fontSize: '1.75rem',
    height: '1.75rem',
    lineHeight: '1.75rem',

    '::before': {
      height: '1.5rem',
      right: '2px',
      top: '2px',
      width: '1.5rem'
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
    color: appTheme.palette.cool10g
  },

  online: {
    color: appTheme.palette.cool
  },

  srOnly: {
    ...srOnly
  }
});

export default withStyles(styleThunk)(AvatarBadge);
