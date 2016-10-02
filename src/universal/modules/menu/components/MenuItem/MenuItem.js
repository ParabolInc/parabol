import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import tinycolor from 'tinycolor2';
import appTheme from 'universal/styles/theme/appTheme';
import {textOverflow} from 'universal/styles/helpers';

// TODO: add option for labels with icons
// import FontAwesome from 'react-fontawesome';

const combineStyles = StyleSheet.combineStyles;

const MenuItem = (props) => {
  const {styles} = MenuItem;
  const {isActive, label, onClick, closeMenu} = props;
  const rootStyles = isActive ? combineStyles(styles.root, styles.active) : styles.root;
  const handleClick = () => {
    closeMenu();
    onClick();
  };
  return (
    // put a tabIndex on the div so the menu goes away if you click on a menu item
    <div className={rootStyles} onClick={handleClick} >
      <div className={styles.label}>{label}</div>
    </div>
  );
};

const activeBackgroundColor = tinycolor.mix(appTheme.palette.mid, '#fff', 85).toHexString();
const hoverFocusStyles = {
  backgroundColor: appTheme.palette.mid10l,
  // for the blue focus outline
  outline: 0
};
const activeHoverFocusStyles = {
  backgroundColor: activeBackgroundColor
};

MenuItem.propTypes = {
  closeMenu: PropTypes.func,
  isActive: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func
};

MenuItem.defaultProps = {
  isActive: false,
  label: 'Menu Item',
  onClick: () => console.log('MenuItem.onClick()')
};

MenuItem.const styleThunk = () => ({
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
