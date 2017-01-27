import React, {PropTypes, Children, cloneElement} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import portal from 'react-portal-hoc';


const Menu = (props) => {
  const {
    closePortal,
    children,
    itemFactory,
    label,
    menuWidth,
    styles,
    coords,
  } = props;
  const menuBlockStyle = {
    width: menuWidth,
    ...coords
  };
  const boxShadow = '0 1px 1px rgba(0, 0, 0, .15)';
  const menuStyle = {boxShadow};
  const kids = Children.map(itemFactory && itemFactory() || children, (child) => cloneElement(child, {closePortal}))
  return (
    <div>
      <div className={css(styles.menuBlock)} style={menuBlockStyle}>
        <div
          className={css(styles.menu)}
          style={menuStyle}
        >
          <div className={css(styles.label)}>{label}</div>
          {kids}
        </div>
      </div>
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
  styles: PropTypes.object,
  toggle: PropTypes.any,
  toggleHeight: PropTypes.string,
  verticalAlign: PropTypes.oneOf([
    'middle',
    'top'
  ]),
  zIndex: PropTypes.string
};

const styleThunk = () => ({
  root: {
    display: 'inline-block',
    position: 'relative',
    zIndex: ui.zMenu
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
    position: 'absolute'
  },
  menu: {
    backgroundColor: ui.menuBackgroundColor,
    border: `1px solid ${appTheme.palette.mid30l}`,
    borderRadius: '.25rem',
    padding: '0 0 .5rem',
    textAlign: 'left',
    width: '100%',
    outline: 0
  },

  label: {
    ...textOverflow,
    borderBottom: `1px solid ${appTheme.palette.mid30l}`,
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: 1,
    padding: '.5rem'
  }
});

export default portal({escToClose: true, clickToClose: true})(withStyles(styleThunk)(Menu));
