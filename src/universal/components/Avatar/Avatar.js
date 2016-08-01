import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';

const combineStyles = StyleSheet.combineStyles;

let s = {};

const renderBadge = (isCheckedIn, isConnected, size) => {
  const connection = isConnected ? 'online' : 'offline';
  const checkin = isCheckedIn ? 'present' : 'absent';
  const iconStyles = combineStyles(
    s.badgeIcon,
    s[connection]
  );
  let icon;
  // TODO: All avatars at least have a circle badge and connection color (lobby, pre-check-in) (TA)
  if (isCheckedIn) {
    icon = 'check-circle';
  } else if (isCheckedIn === false) {
    icon = 'times-circle';
  } else {
    icon = 'circle';
  }
  const largeBadgeClass = size === 'medium' || size === 'large' || size === 'largest';
  const badgeStyles = largeBadgeClass ? combineStyles(s.badge, s.badgeLarge) : s.badge;

  return (
    <div className={badgeStyles}>
      <FontAwesome className={iconStyles} name={icon}/>
      <span className={s.srOnly}>
        {`${connection}, `}{checkin}
      </span>
    </div>
  );
};

const Avatar = (props) => {
  const {
    hasLabel,
    labelRight,
    hasTooltip,
    isConnected,
    isCheckedIn,
    picture,
    preferredName,
    onClick,
    size
  } = props;

  const trimmedName = preferredName.replace(/\s+/g, '');
  const handleMouseLeave = () => {
    console.log('Avatar.onMouseLeave.handleMouseLeave()');
    // TODO: Dispatch UI state for hover to show optional tooltip.
  };

  const handleMouseEnter = () => {
    console.log('Avatar.onMouseEnter.handleMouseEnter()');
    console.log(`Peep is ${props.isConnected}`);
    // TODO: Dispatch UI state for hover to show optional tooltip.
  };

  let avatarStyles = s.avatar;
  let avatarLabelStyles = s.avatarLabel;
  let imagePositionStyles = s.avatarImageDisplay;
  let imageBlockStyles = s.avatarImageBlock;

  const sizeName = size.charAt(0).toUpperCase() + size.slice(1);
  const sizeStyles = `avatar${sizeName}`;
  const imageSizeStyles = `avatarImageBlock${sizeName}`;

  avatarStyles = combineStyles(s.avatar, s[sizeStyles]);
  imageBlockStyles = combineStyles(s.avatarImageBlock, s[imageSizeStyles]);

  // Position label to the right of avatar image
  if (labelRight) {
    imagePositionStyles = combineStyles(
      s.avatarImageDisplay,
      s.avatarImageDisplayInlineBlock
    );
    avatarLabelStyles = combineStyles(
      s.avatarLabel,
      s.avatarLabelInlineBlock
    );
  }

  return (
    <div
      className={avatarStyles}
      onClick={onClick}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div className={imagePositionStyles}>
        <div className={imageBlockStyles}>
          <img className={s.avatarImage} src={picture} />
          {renderBadge(isCheckedIn, isConnected, size)}
        </div>
      </div>
      {hasLabel &&
        <div className={avatarLabelStyles}>@{trimmedName}</div>
      }
      {hasTooltip &&
        <div className={s.avatarTooltip}>@{trimmedName}</div>
      }
    </div>
  );
};

Avatar.propTypes = {
  hasLabel: PropTypes.bool,
  hasTooltip: PropTypes.bool,
  isCheckedIn: PropTypes.bool,
  isConnected: PropTypes.bool,
  picture: PropTypes.string,
  labelRight: PropTypes.bool,
  preferredName: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.oneOf([
    'smallest',
    'small',
    'medium',
    'large',
    'largest'
  ])
};

Avatar.defaultProps = {
  isCheckedIn: false,
  isConnected: false,
  picture: 'https://placekitten.com/g/600/600',
  preferredName: 'Elizabeth Robertson',
  size: 'small'
};

s = StyleSheet.create({
  avatar: {
    display: 'inline-block',
    fontSize: theme.typography.s2,
    margin: '0',
    position: 'relative',
    textAlign: 'center',
    verticalAlign: 'middle'
  },

  // TODO: Add ':hover' s for onClick handler

  // NOTE: Size modifies for avatar
  avatarSmallest: {
    fontSize: theme.typography.s1
  },
  avatarSmall: {
    fontSize: theme.typography.s2
  },
  avatarMedium: {
    fontSize: theme.typography.s4
  },
  avatarLarge: {
    fontSize: theme.typography.s4
  },
  avatarLargest: {
    fontSize: theme.typography.s6
  },
  // TODO terry help me make this not look ugly
  avatarImageDisplay: {
    border: 'solid 3px',
    borderColor: (props) => (props.hasBorder ? 'pink' : 'white'),
    borderRadius: '100%',
    display: 'block'
  },

  // NOTE: Modifies avatarImageDisplay
  avatarImageDisplayInlineBlock: {
    display: 'inline-block',
    verticalAlign: 'middle'
  },

  avatarImageBlock: {
    display: 'block',
    margin: '0 auto',
    position: 'relative',
    width: '2.75rem'
  },

  // NOTE: Size modifies for avatarImageBlock
  avatarImageBlockSmallest: {
    width: '2rem'
  },
  avatarImageBlockSmall: {
    width: '2.75rem'
  },
  avatarImageBlockMedium: {
    width: '5rem'
  },
  avatarImageBlockLarge: {
    width: '6rem'
  },
  avatarImageBlockLargest: {
    width: '7.5rem'
  },

  avatarImage: {
    borderRadius: '100%',
    boxShadow: '0 0 1px 1px rgba(0, 0, 0, .2)',
    display: 'block',
    height: 'auto',
    width: '100%'
  },

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

  srOnly: {
    ...srOnly
  },

  badgeIcon: {
    height: '1em',
    lineHeight: '1em',
    position: 'relative',
    width: '1em',
    zIndex: 400
  },

  avatarLabel: {
    color: theme.palette.dark,
    fontSize: 'inherit',
    margin: '1em 0'
  },

  avatarLabelInlineBlock: {
    display: 'inline-block',
    marginLeft: '1em',
    verticalAlign: 'middle'
  },

  avatarTooltip: {
    // TODO: Style this sub-component
  },

  offline: {
    color: theme.palette.cool10g
  },

  online: {
    color: theme.palette.cool
  },
});

export default look(Avatar);
