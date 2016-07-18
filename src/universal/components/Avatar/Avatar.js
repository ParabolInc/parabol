import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

let s = {};

const renderBadge = (badge, size) => {
  let badgeStyles = s.badge;
  let icon;
  let iconStyles;

  const badgeType = badge.charAt(0).toUpperCase() + badge.slice(1);
  const badgeIconStyles = `badgeIcon${badgeType}`;

  iconStyles = combineStyles(
    s.badgeIcon,
    s[badgeIconStyles]
  );

  if (badge === 'present') {
    icon = 'check-circle';
  } else if (badge === 'absent') {
    icon = 'times-circle';
  } else {
    icon = 'circle';
  }

  if (size === 'medium' || size === 'large' || size === 'largest') {
    badgeStyles = combineStyles(s.badge, s.badgeLarge);
  }

  return (
    <div className={badgeStyles}>
      <FontAwesome className={iconStyles} name={icon} />
      <span className={s.badgeLabel}>
        {badge}
      </span>
    </div>
  );
};

const Avatar = (props) => {
  const {
    badge,
    hasLabel,
    labelRight,
    hasTooltip,
    image,
    name,
    onClick,
    size
  } = props;

  const trimmedName = name.replace(/\s+/g, '');

  const handleMouseLeave = () => {
    console.log('Avatar.onMouseLeave.handleMouseLeave()');
    // TODO: Dispatch UI state for hover to show optional tooltip.
  };

  const handleMouseEnter = () => {
    console.log('Avatar.onMouseEnter.handleMouseEnter()');
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
          <img className={s.avatarImage} src={image} />
          {badge && renderBadge(badge, size)}
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
  badge: PropTypes.oneOf([
    'absent',
    'active',
    'offline',
    'online',
    'present'
  ]),
  hasLabel: PropTypes.bool,
  hasTooltip: PropTypes.bool,
  image: PropTypes.string,
  labelRight: PropTypes.bool,
  name: PropTypes.string,
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
  image: 'https://placekitten.com/g/600/600',
  name: 'Elizabeth Robertson',
  size: 'small'
};

s = StyleSheet.create({
  avatar: {
    display: 'block',
    fontSize: theme.typography.s2,
    margin: '0',
    position: 'relative',
    textAlign: 'center'
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

  avatarImageDisplay: {
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

  badgeLabel: {
    // TODO: Make mixin for Sass: @include sr-only;
    border: 0,
    clip: 'rect(0, 0, 0, 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px'
  },

  badgeIcon: {
    height: '1em',
    lineHeight: '1em',
    position: 'relative',
    width: '1em',
    zIndex: 400
  },

  // NOTE: Modifiers for badgeIcon
  badgeIconPresent: {
    color: theme.palette.cool
  },
  badgeIconAbsent: {
    color: theme.palette.cool10g
  },
  badgeIconActive: {
    color: theme.palette.warm
  },
  badgeIconOffline: {
    color: theme.palette.cool10g
  },
  badgeIconOnline: {
    color: theme.palette.cool
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
  }
});

export default look(Avatar);
