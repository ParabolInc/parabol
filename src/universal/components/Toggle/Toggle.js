import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

//    TODO:
//  • Add hover/focus/disabled states (TA)
//  • Add palette variants (TA)
//  • Add animation state (turning off/on) (TA)

const Toggle = (props) => {
  const {
    active,
    block,
    disabled,
    label,
    onClick,
    styles
  } = props;

  const toggleStyles = css(
    styles.toggle,
    active && styles.active,
    block && styles.block,
    disabled && styles.disabled
  );

  return (
    <div className={toggleStyles} onClick={onClick}>
      <span className={css(styles.label)}>
        {label}
      </span>
    </div>
  );
};

Toggle.propTypes = {
  active: PropTypes.bool,
  block: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  styles: PropTypes.object
};

Toggle.defaultProps = {
  active: false,
  label: 'Off'
};

const gutter = 3;
const size = '2rem';
const innerSize = '1.625rem';

const styleThunk = () => ({
  toggle: {
    backgroundColor: appTheme.palette.mid60l,
    borderRadius: size,
    color: '#fff',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: 0,
    height: size,
    lineHeight: size,
    paddingLeft: size,
    paddingRight: gutter,
    position: 'relative',
    textAlign: 'center',
    userSelect: 'none',

    ':after': {
      backgroundColor: appTheme.palette.mid10l,
      borderRadius: size,
      boxShadow: '0 .0625rem 0 rgba(0, 0, 0, .2)',
      display: 'block',
      content: '""',
      height: innerSize,
      left: gutter,
      position: 'absolute',
      top: gutter,
      width: innerSize
    },

    ':hover': {
      opacity: 0.65
    }
  },

  // NOTE: modifies 'toggle'
  active: {
    backgroundColor: appTheme.palette.cool,
    paddingLeft: gutter,
    paddingRight: size,

    ':after': {
      left: 'auto',
      right: gutter
    }
  },

  // NOTE: modifies 'toggle'
  block: {
    display: 'block'
  },

  // NOTE: modifies 'toggle'
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,

    ':hover': {
      opacity: 0.5
    }
  },

  // NOTE: inner element
  label: {
    display: 'inline-block',
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    padding: '0 .5rem',
    textShadow: '0 1px 0 rgba(0, 0, 0, .2)'
  }
});

export default withStyles(styleThunk)(Toggle);
