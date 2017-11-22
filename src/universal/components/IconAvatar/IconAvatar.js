import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const IconAvatar = (props) => {
  const {
    icon,
    size,
    styles,
    title
  } = props;

  const rootStyles = css(
    styles.root,
    styles[size]
  );

  const iconStyle = {
    fontSize: 'inherit',
    lineHeight: ui.iconSize
  };

  return (
    <div className={rootStyles} title={title}>
      <FontAwesome name={icon} style={iconStyle} />
    </div>
  );
};

IconAvatar.propTypes = {
  icon: PropTypes.string,
  size: PropTypes.oneOf([
    'small',
    'medium',
    'large'
  ]),
  styles: PropTypes.object,
  title: PropTypes.string
};

IconAvatar.defaultProps = {
  size: 'small',
  title: 'Icon Avatar'
};

const styleThunk = () => {
  const smallSize = '2rem';
  const mediumSize = '2.75rem';
  const largeSize = '4rem';
  return {
    root: {
      alignItems: 'center',
      backgroundColor: appTheme.palette.mid70l,
      borderRadius: '100%',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center'
    },

    small: {
      fontSize: ui.iconSize,
      height: smallSize,
      width: smallSize
    },

    medium: {
      fontSize: ui.iconSizeAvatar,
      height: mediumSize,
      width: mediumSize
    },

    large: {
      fontSize: ui.iconSize2x,
      height: largeSize,
      width: largeSize
    }
  };
};

export default withStyles(styleThunk)(IconAvatar);
