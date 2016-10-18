import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import upperFirst from 'universal/utils/upperFirst';
import AvatarBadge from 'universal/components/AvatarBadge/AvatarBadge';
import makeUsername from 'universal/utils/makeUsername';

// TODO: Add tooltip module (TA)

const Avatar = (props) => {
  const {
    hasBadge,
    hasBorder,
    hasLabel,
    labelRight,
    isCheckedIn,
    isClickable,
    isConnected,
    picture,
    preferredName,
    onClick,
    size,
    styles
  } = props;

  const username = makeUsername(preferredName);
  const sizeName = upperFirst(size);
  const sizeStyles = `avatar${sizeName}`;
  const imageSizeStyles = `avatarImageBlock${sizeName}`;
  const rootInlineStyle = isClickable ? {cursor: 'pointer'} : {cursor: 'default'};
  const avatarImagesStyles = css(
    styles.avatarImage,
    hasBorder ? styles.hasBorder : styles.boxShadow
  );
  const avatarStyles = css(styles.avatar, styles[sizeStyles]);
  const imageBlockStyles = css(styles.avatarImageBlock, styles[imageSizeStyles]);
  // Position label to the right of avatar image
  const avatarLabelStyles = css(
    styles.avatarLabel,
    labelRight && styles.avatarLabelInlineBlock
  );
  const imagePositionStyles = css(
    styles.avatarImageDisplay,
    labelRight && styles.avatarImageDisplayInlineBlock
  );
  return (
    <div
      className={avatarStyles}
      onClick={onClick}
      style={rootInlineStyle}
    >
      <div className={imagePositionStyles}>
        <div className={imageBlockStyles}>
          <img className={avatarImagesStyles} src={picture}/>
          {hasBadge && <AvatarBadge isCheckedIn={isCheckedIn} isConnected={isConnected} size={size}/>}
        </div>
      </div>
      {hasLabel &&
        <div className={avatarLabelStyles}>@{username}</div>
      }
    </div>
  );
};

Avatar.propTypes = {
  hasBadge: PropTypes.bool,
  hasBorder: PropTypes.bool,
  hasLabel: PropTypes.bool,
  isCheckedIn: PropTypes.bool,
  isClickable: PropTypes.bool,
  isConnected: PropTypes.bool,
  picture: PropTypes.string,
  labelRight: PropTypes.bool,
  preferredName: PropTypes.string,
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

const boxShadowDefault = '0 0 1px 1px rgba(0, 0, 0, .2)';
const boxShadowWarm = `0 0 1px 1px ${appTheme.palette.warm}`;
const styleThunk = () => ({
  avatar: {
    display: 'inline-block',
    fontSize: appTheme.typography.s2,
    margin: '0',
    position: 'relative',
    textAlign: 'center',
    verticalAlign: 'middle'
  },

  // NOTE: Size modifies avatar
  avatarSmallest: {
    fontSize: appTheme.typography.s1
  },
  avatarSmaller: {
    fontSize: appTheme.typography.s1
  },
  avatarSmall: {
    fontSize: appTheme.typography.s2
  },
  avatarMedium: {
    fontSize: appTheme.typography.s3
  },
  avatarLarge: {
    fontSize: appTheme.typography.s4
  },
  avatarLarger: {
    fontSize: appTheme.typography.s4
  },
  avatarLargest: {
    fontSize: appTheme.typography.s6
  },

  avatarImageDisplay: {
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

  // NOTE: Size modifies avatarImageBlock
  avatarImageBlockFill: {
    width: '100%'
  },
  avatarImageBlockSmallest: {
    width: '1.5rem'
  },
  avatarImageBlockSmaller: {
    width: '2rem'
  },
  avatarImageBlockSmall: {
    width: '2.75rem'
  },
  avatarImageBlockMedium: {
    width: '4rem'
  },
  avatarImageBlockLarge: {
    width: '5rem'
  },
  avatarImageBlockLarger: {
    width: '6rem'
  },
  avatarImageBlockLargest: {
    width: '7.5rem'
  },

  avatarImage: {
    borderRadius: '100%',
    display: 'block',
    height: 'auto',
    width: '100%'
  },

  boxShadow: {
    boxShadow: boxShadowDefault
  },

  hasBorder: {
    boxShadow: boxShadowWarm
  },

  avatarLabel: {
    color: appTheme.palette.dark,
    fontSize: 'inherit',
    margin: '1em 0'
  },

  avatarLabelInlineBlock: {
    display: 'inline-block',
    marginLeft: '1em',
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(Avatar);
