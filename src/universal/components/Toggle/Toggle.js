import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

//    TODO:
//  • Add palette variants (TA)
//  • Add disabled styles (TA)
//  • Add animation state (turning off/on) (TA)

const Toggle = (props) => {
  const {
    active,
    block,
    label,
    styles
  } = props;

  const toggleStyles = css(
    styles.toggle,
    active && styles.active,
    block && styles.block
  );

  return (
    <div className={toggleStyles} onClick={() => (console.log('toggle clicked'))}>
      <span className={css(styles.label)}>
        {label}
      </span>
    </div>
  );
};

Toggle.propTypes = {
  active: PropTypes.bool,
  block: PropTypes.bool,
  label: PropTypes.string,
  styles: PropTypes.object
};

Toggle.defaultProps = {
  active: false,
  label: 'Off'
};

const borderWidth = '.125rem';
const size = '2rem';
const height = size;
const width = size;

const styleThunk = () => ({
  toggle: {
    backgroundColor: appTheme.palette.mid10l,
    borderRadius: size,
    boxShadow: `inset 0 0 0 ${borderWidth} rgba(0, 0, 0, .05)`,
    color: appTheme.palette.mid,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: 0,
    height,
    lineHeight: height,
    paddingLeft: size,
    paddingRight: borderWidth,
    position: 'relative',
    textAlign: 'center',
    userSelect: 'none',

    ':after': {
      backgroundColor: appTheme.palette.mid50l,
      borderRadius: size,
      boxShadow: `inset 0 0 0 ${borderWidth} rgba(0, 0, 0, .1)`,
      display: 'block',
      content: '""',
      height,
      left: 0,
      position: 'absolute',
      top: 0,
      width,
    }
  },

  // NOTE: modifies 'toggle'
  active: {
    color: appTheme.palette.cool,
    paddingLeft: borderWidth,
    paddingRight: size,

    ':after': {
      backgroundColor: 'currentColor',
      left: 'auto',
      right: 0
    }
  },

  // NOTE: modifies 'toggle'
  block: {
    display: 'block'
  },

  // NOTE: inner element
  label: {
    display: 'inline-block',
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    padding: '0 .5rem'
  }
});

export default withStyles(styleThunk)(Toggle);
