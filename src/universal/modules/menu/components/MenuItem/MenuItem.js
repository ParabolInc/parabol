import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';
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
  }
  return (
    // put a tabIndex on the div so the menu goes away if you click on a menu item
    <div className={rootStyles} onClick={handleClick} >
      <div className={styles.label}>{label}</div>
    </div>
  );
};

const activeBackgroundColor = tinycolor.mix(theme.palette.mid, '#fff', 85).toHexString();
const hoverFocusStyles = {
  backgroundColor: theme.palette.mid10l,
  // for the blue focus outline
  outline: 0
};
const activeHoverFocusStyles = {
  backgroundColor: activeBackgroundColor
};

MenuItem.propTypes = {
  isActive: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func
};

MenuItem.defaultProps = {
  isActive: false,
  label: 'Menu Item',
  onClick: () => console.log('MenuItem.onClick()')
};

MenuItem.styles = StyleSheet.create({
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
    color: theme.palette.dark,
    fontSize: theme.typography.s2,
    fontWeight: 700,
    lineHeight: '1.5rem',
    padding: '.25rem .5rem'
  }
});

export default look(MenuItem);
