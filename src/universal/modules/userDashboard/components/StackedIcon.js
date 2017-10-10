import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const iconStyle = {
  fontSize: ui.iconSize,
  lineHeight: ui.iconSize
};

const StackedIcon = (props) => {
  const {top, bottom, color, styles} = props;
  const topIconStyle = {
    ...iconStyle,
    color
  };
  return (
    <div className={css(styles.iconStacked)}>
      <FontAwesome className={css(styles.iconTop)} name={top} style={topIconStyle} />
      <FontAwesome className={css(styles.iconBottom)} name={bottom} style={iconStyle} />
    </div>
  );
};

StackedIcon.propTypes = {
  top: PropTypes.string.isRequired,
  bottom: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  styles: PropTypes.object
};

const iconBase = {
  left: 0,
  position: 'absolute',
  textAlign: 'center',
  top: 0,
  verticalAlign: 'middle'
};

const styleThunk = () => ({
  iconStacked: {
    height: ui.iconSize,
    margin: '0 .0625rem',
    position: 'relative',
    width: ui.iconSize
  },

  iconTop: {
    ...iconBase,
    zIndex: 200
  },

  iconBottom: {
    ...iconBase,
    color: '#fff',
    textShadow: '0 .0625rem 0 rgba(255, 255, 255, .35)',
    zIndex: 100
  }
});

export default withStyles(styleThunk)(StackedIcon);
