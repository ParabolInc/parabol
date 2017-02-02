import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import tinycolor from 'tinycolor2';
import appTheme from 'universal/styles/theme/appTheme';
import {textOverflow} from 'universal/styles/helpers';

// TODO: add option for labels with icons
// import FontAwesome from 'react-fontawesome';

const MenuItem = (props) => {
  const {isActive, label, onClick, closePortal, styles} = props;
  const rootStyles = css(styles.root, isActive && styles.active);
  const handleClick = () => {
    if (closePortal) {
      closePortal();
    }
    if (onClick) {
      // if a component is passed in instead of just a text label, it may not include a click handler
      onClick();
    }
  };
  const labelEl = typeof label === 'string' ? <div className={css(styles.label)}>{label}</div> : label;
  return (
    <div className={rootStyles} onClick={handleClick} >
      {labelEl}
    </div>
  );
};

MenuItem.propTypes = {
  closePortal: PropTypes.func,
  isActive: PropTypes.bool,
  label: PropTypes.any,
  onClick: PropTypes.func,
  styles: PropTypes.object
};

const activeBackgroundColor = tinycolor.mix(appTheme.palette.mid, '#fff', 85).toHexString();
const hoverFocusStyles = {
  backgroundColor: appTheme.palette.mid10l,
  // for the blue focus outline
  outline: 0
};
const activeHoverFocusStyles = {
  backgroundColor: activeBackgroundColor,
  styles: PropTypes.object
};


const styleThunk = () => ({
  root: {
    backgroundColor: 'transparent',
    cursor: 'pointer',
    ':hover': {
      ...hoverFocusStyles
    },
    ':focus': {
      ...hoverFocusStyles
    }
  },

  active: {
    backgroundColor: activeBackgroundColor,
    cursor: 'default',

    ':hover': {
      ...activeHoverFocusStyles
    },
    ':focus': {
      ...activeHoverFocusStyles
    }
  },

  label: {
    ...textOverflow,
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: '1.5rem',
    padding: '.25rem .5rem'
  }
});

export default withStyles(styleThunk)(MenuItem);
