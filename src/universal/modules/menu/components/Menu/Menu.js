import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';

let styles = {};

const Menu = (props) => {
  const {
    children,
    isOpen,
    label,
    menuOrientation,
    menuWidth,
    toggle,
    toggleHeight,
    toggleMenu,
    verticalAlign
  } = props;

  const toggleHeightStyle = {
    height: toggleHeight,
    lineHeight: toggleHeight,
    verticalAlign
  };

  const menuBlockStyle = {
    [menuOrientation]: 0,
    width: menuWidth
  };

  const toggleStyle = isOpen ? {opacity: '.5'} : null;

  const rootStyle = toggleHeight ? toggleHeightStyle : {verticalAlign};
  const boxShadow = '0 1px 1px rgba(0, 0, 0, .15)';
  const menuStyle = {boxShadow};
  return (
    <div className={styles.root} style={rootStyle}>
      <div className={styles.toggle} onClick={toggleMenu} style={{...rootStyle, ...toggleStyle}}>{toggle}</div>
      {isOpen &&
        <div className={styles.menuBlock} style={menuBlockStyle}>
          <div
            className={styles.menu}
            style={menuStyle}
          >
            <div className={styles.label}>{label}</div>
            {children}
          </div>
        </div>
      }
    </div>
  );
};

Menu.defaultProps = {
  menuOrientation: 'left',
  menuWidth: '12rem',
  toggle: 'Toggle Menu',
  verticalAlign: 'middle'
};

Menu.propTypes = {
  children: PropTypes.any,
  isOpen: PropTypes.bool,
  label: PropTypes.string,
  menuOrientation: PropTypes.oneOf([
    'left',
    'right'
  ]),
  menuWidth: PropTypes.string,
  toggle: PropTypes.any,
  toggleHeight: PropTypes.string,
  toggleMenu: PropTypes.func.isRequired,
  verticalAlign: PropTypes.oneOf([
    'middle',
    'top'
  ]),
};

styles = StyleSheet.create({
  root: {
    display: 'inline-block',
    position: 'relative'
  },

  toggle: {
    cursor: 'pointer',
    userSelect: 'none',

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    }
  },

  menuBlock: {
    paddingTop: '.25rem',
    position: 'absolute',
    top: '100%'
  },
  menu: {
    backgroundColor: ui.menuBackgroundColor,
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.25rem',
    padding: '0 0 .5rem',
    textAlign: 'left',
    width: '100%',
    outline: 0
  },

  label: {
    ...textOverflow,
    borderBottom: `1px solid ${theme.palette.mid30l}`,
    color: theme.palette.mid,
    fontSize: theme.typography.s2,
    fontWeight: 700,
    lineHeight: 1,
    padding: '.5rem'
  }
});

export default look(Menu);
