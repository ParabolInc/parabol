import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import AvatarBadge from 'universal/components/AvatarBadge/AvatarBadge';

const Avatar = (props) => {
  const {
    hasBadge,
    isCheckedIn,
    isClickable,
    isConnected,
    onClick,
    picture,
    sansRadius,
    sansShadow,
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
    sansRadius && styles.sansRadius,
    sansShadow && styles.sansShadow
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
          <div className={css(styles.badgeBlock)}>
            <div className={css(styles.badgeBlockInner)}>
              <AvatarBadge
                isCheckedIn={isCheckedIn}
                isConnected={isConnected}
              />
            </div>
          </div>
        }
      </div>
    </div>
  );
};

Avatar.propTypes = {
  hasBadge: PropTypes.bool,
  isCheckedIn: PropTypes.bool,
  isClickable: PropTypes.bool,
  isConnected: PropTypes.bool,
  onClick: PropTypes.func,
  picture: PropTypes.string,
  sansRadius: PropTypes.bool,
  sansShadow: PropTypes.bool,
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

const styleThunk = () => ({
  avatar: {
    display: 'inline-block',
    position: 'relative',
    verticalAlign: 'middle'
  },

  avatarImageBlock: {
    borderRadius: '100%',
    boxShadow: ui.avatarDefaultBoxShadow,
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

  sansShadow: {
    boxShadow: 'none'
  },

  sansRadius: {
    borderRadius: 0
  },

  badgeBlock: {
    height: '25%',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '25%'
  },

  badgeBlockInner: {
    height: '14px',
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '14px'
  }
});

export default withStyles(styleThunk)(Avatar);
