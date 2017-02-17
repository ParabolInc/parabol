import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import AvatarBadge from 'universal/components/AvatarBadge/AvatarBadge';
import Tesla from 'universal/styles/theme/images/avatars/tesla-circa-1890.jpeg';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';

// TODO: Add tooltip module (TA)

const Avatar = (props) => {
  const {
    hasBadge,
    hasBorder,
    isActive,
    isCheckedIn,
    isClickable,
    isConnected,
    picture,
    onClick,
    size,
    styles
  } = props;

  const rootStyles = css(
    styles.avatar,
    styles[size]
  );
  const rootInlineStyle = isClickable ? {cursor: 'pointer'} : {cursor: 'default'};
  const imageBlockStyles = css(
    styles.avatarImageBlock,
    hasBorder ? styles.hasBorder : styles.boxShadow,
    isActive && styles.isActive
  );
  // NOTE: This is a WIP! Will clean up after working on all instances (TA)
  const localHackPicture = picture || Tesla || defaultUserAvatar;
  const imageBlockInlineStyle = {
    backgroundImage: `url(${localHackPicture})`,
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover'
  };
  return (
    <div
      className={rootStyles}
      onClick={onClick}
      style={rootInlineStyle}
    >
      <div
        className={imageBlockStyles}
        style={imageBlockInlineStyle}
      >
        {hasBadge &&
          <AvatarBadge
            isCheckedIn={isCheckedIn}
            isConnected={isConnected}
            size={size}
          />
        }
      </div>
    </div>
  );
};

Avatar.propTypes = {
  hasBadge: PropTypes.bool,
  hasBorder: PropTypes.bool,
  isActive: PropTypes.bool,
  isCheckedIn: PropTypes.bool,
  isClickable: PropTypes.bool,
  isConnected: PropTypes.bool,
  picture: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.oneOf([
    'fill',
    'smallest',
    'smaller',
    'small',
    'medium',
    'large',
    'larger',
    'largest'
  ]),
  styles: PropTypes.object
};

const borderDefault = appTheme.palette.mid20a;
const borderWarm = appTheme.palette.warm80a;
const boxShadowDefault = ui.avatarDefaultBoxShadow;
const boxShadowBase = '0 0 0 2px #fff, 0 0 0 4px';
const boxShadowBorder = `${boxShadowBase} ${borderDefault}`;
const boxShadowWarm = `${boxShadowBase} ${borderWarm}`;

const styleThunk = () => ({
  avatar: {
    display: 'inline-block',
    position: 'relative',
    verticalAlign: 'middle'
  },

  avatarImageBlock: {
    borderRadius: '100%',
    display: 'block',
    height: 0,
    margin: '0 auto',
    padding: '100% 0 0',
    position: 'relative',
    width: '100%'
  },

  // NOTE: Size modifies avatarImageBlock
  fill: {
    width: '100%'
  },
  smallest: {
    width: '1.5rem'
  },
  smaller: {
    width: '2rem'
  },
  small: {
    width: '2.75rem'
  },
  medium: {
    width: '4rem'
  },
  large: {
    width: '5rem'
  },
  larger: {
    width: '6rem'
  },
  largest: {
    width: '7.5rem'
  },

  boxShadow: {
    boxShadow: boxShadowDefault
  },

  hasBorder: {
    boxShadow: boxShadowBorder
  },

  isActive: {
    boxShadow: boxShadowWarm
  }
});

export default withStyles(styleThunk)(Avatar);
