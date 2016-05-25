import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Avatar extends Component {
  static propTypes = {
    badge: PropTypes.oneOf([
      'absent',
      'active',
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

  renderBadge() {
    const { badge, size } = this.props;
    let badgeStyles = styles.badge;
    let icon;
    let iconStyles;

    const badgeType = badge.charAt(0).toUpperCase() + badge.slice(1);
    const badgeIconStyles = `badgeIcon${badgeType}`;

    iconStyles = combineStyles(
      styles.badgeIcon,
      styles[badgeIconStyles]
    );

    if (badge === 'present') {
      icon = 'check-circle';
    } else if (badge === 'absent') {
      icon = 'times-circle';
    } else if (badge === 'active') {
      icon = 'circle';
    }

    if (size === 'medium' || size === 'large' || size === 'largest') {
      badgeStyles = combineStyles(styles.badge, styles.badgeLarge);
    }

    return (
      <div className={badgeStyles}>
        <FontAwesome className={iconStyles} name={icon} />
        <span className={styles.badgeLabel}>
          {badge}
        </span>
      </div>
    );
  }

  render() {
    const {
      badge,
      hasLabel,
      labelRight,
      hasTooltip,
      image,
      name,
      onClick,
      size
    } = this.props;

    const avatarImage = image || 'https://placekitten.com/g/600/600';
    const avatarName = name || 'Elizabeth Robertson';
    const avatarSize = size || 'small';

    const trimmedName = avatarName.replace(/\s+/g, '');

    const handleMouseLeave = () => {
      console.log('Avatar.onMouseLeave.handleMouseLeave()');
      // TODO: Dispatch UI state for hover to show optional tooltip.
    };

    const handleMouseEnter = () => {
      console.log('Avatar.onMouseEnter.handleMouseEnter()');
      // TODO: Dispatch UI state for hover to show optional tooltip.
    };

    let avatarStyles = styles.avatar;
    let avatarLabelStyles = styles.avatarLabel;
    let imagePositionStyles = styles.avatarImageDisplay;
    let imageBlockStyles = styles.avatarImageBlock;

    const sizeName = avatarSize.charAt(0).toUpperCase() + avatarSize.slice(1);
    const avatarSizeStyles = `avatar${sizeName}`;
    const avatarImageSizeStyles = `avatarImageBlock${sizeName}`;

    avatarStyles = combineStyles(styles.avatar, styles[avatarSizeStyles]);
    imageBlockStyles = combineStyles(styles.avatarImageBlock, styles[avatarImageSizeStyles]);

    // Position label to the right of avatar image
    if (labelRight) {
      imagePositionStyles = combineStyles(
        styles.avatarImageDisplay,
        styles.avatarImageDisplayInlineBlock
      );
      avatarLabelStyles = combineStyles(
        styles.avatarLabel,
        styles.avatarLabelInlineBlock
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
            <img className={styles.avatarImage} src={avatarImage} />
            {badge &&
              this.renderBadge()
            }
          </div>
        </div>
        {hasLabel &&
          <div className={avatarLabelStyles}>@{trimmedName}</div>
        }
        {hasTooltip &&
          <div className={styles.avatarTooltip}>@{trimmedName}</div>
        }
      </div>
    );
  }
}

styles = StyleSheet.create({
  avatar: {
    display: 'block',
    fontSize: theme.typography.fs2,
    margin: '0',
    position: 'relative',
    textAlign: 'center'
  },

  // TODO: Add ':hover' styles for onClick handler

  // NOTE: Size modifies for avatar
  avatarSmallest: {
    fontSize: theme.typography.fs1
  },
  avatarSmall: {
    fontSize: theme.typography.fs2
  },
  avatarMedium: {
    fontSize: theme.typography.fs4
  },
  avatarLarge: {
    fontSize: theme.typography.fs4
  },
  avatarLargest: {
    fontSize: theme.typography.fs6
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
    // TODO: Set theme value for consistent box-shadow values
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
      // TODO: Set UI/theme variables for z-index scale
      // z-index: $zi-3;
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
      // TODO: Set UI/theme variables for z-index scale
      // z-index: $zi-2;
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
    // TODO: Set UI/theme variables for z-index scale
    // z-index: $zi-4;
    zIndex: 400
  },

  // NOTE: Modifiers for badgeIcon
  badgeIconPresent: {
    color: theme.palette.cool
  },
  badgeIconAbsent: {
    // TODO: Add gray mix palette to theme build (TA)
    color: tinycolor.mix(theme.palette.cool, '#808080', 90).toHexString()
  },
  badgeIconActive: {
    color: theme.palette.warm
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
