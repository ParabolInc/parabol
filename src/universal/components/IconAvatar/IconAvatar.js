import React, {PropTypes} from 'react';
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

  return (
    <div className={rootStyles} title={title}>
      <FontAwesome className={css(styles.icon)} name={icon} />
    </div>
  );
};

IconAvatar.propTypes = {
  colorPalette: PropTypes.oneOf([
    'cool',
    'dark',
    'mid',
    'warm'
  ]),
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

const styleThunk = (customTheme, {colorPalette}) => {
  const color = appTheme.palette[colorPalette] || appTheme.palette.mid;
  const borderColor = appTheme.palette[`${colorPalette}50l`] || appTheme.palette.mid50l;
  const smallSize = '2rem';
  const mediumSize = '2.75rem';
  const largeSize = '4rem';
  return {
    root: {
      alignItems: 'center',
      borderColor,
      borderRadius: '100%',
      borderStyle: 'solid',
      color,
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center'
    },

    small: {
      borderWidth: '.125rem',
      fontSize: ui.iconSize,
      height: smallSize,
      width: smallSize
    },

    medium: {
      borderWidth: '.125rem',
      fontSize: ui.iconSizeAvatar,
      height: mediumSize,
      width: mediumSize
    },

    large: {
      borderWidth: '.25rem',
      fontSize: ui.iconSize2x,
      height: largeSize,
      width: largeSize
    },

    icon: {
      fontSize: 'inherit !important',
      height: ui.iconSize2x,
      lineHeight: ui.iconSize2x,
      width: ui.iconSize2x
    }
  };
};

export default withStyles(styleThunk)(IconAvatar);
