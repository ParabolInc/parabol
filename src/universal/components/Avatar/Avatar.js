import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import AvatarBadge from 'universal/components/AvatarBadge/AvatarBadge';

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
    styles,
    unstyled
  } = props;

  const rootStyles = css(
    styles.avatar,
    styles[size]
  );
  const rootInlineStyle = isClickable ? {cursor: 'pointer'} : {cursor: 'default'};
  const imageBlockStyles = css(
    styles.avatarImageBlock,
    hasBorder ? styles.hasBorder : styles.boxShadow,
    isActive && styles.isActive,
    unstyled && styles.unstyled
  );
  const imageBlockInlineStyle = {
    backgroundImage: `url(${picture})`,
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
  styles: PropTypes.object,
  unstyled: PropTypes.bool
};

const borderDefault = appTheme.palette.mid20a;
const borderWarm = appTheme.palette.warm80a;
const boxShadowDefault = ui.avatarDefaultBoxShadow;
const boxShadowBase = '0 0 0 3px #fff, 0 0 0 7px';
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
  },

  unstyled: {
    boxShadow: 'none',
    borderRadius: 0
  }
});

export default withStyles(styleThunk)(Avatar);
