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
  // TODO: Make a UI constant (TA)
  const boxShadow = '0 3px 6px rgba(0, 0, 0, .35)';
  const menuStyle = {boxShadow};
  const kids = Children.map(itemFactory && itemFactory() || children, (child) => cloneElement(child, {closePortal}));
  return (
    <div>
      <div className={css(styles.menuBlock)} style={menuBlockStyle}>
        <div
          className={css(styles.menu)}
          style={menuStyle}
        >
          {label && <div className={css(styles.label)}>{label}</div>}
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
  closePortal: PropTypes.func,
  coords: PropTypes.object,
  isOpen: PropTypes.bool,
  itemFactory: PropTypes.func,
  label: PropTypes.string,
  menuOrientation: PropTypes.oneOf([
    'left',
    'right'
  ]),
  menuWidth: PropTypes.string,
  styles: PropTypes.object,
  toggle: PropTypes.any,
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
    border: `1px solid ${ui.menuBorderColor}`,
    borderRadius: '.25rem',
    overflow: 'hidden',
    paddingBottom: ui.menuGutterVertical,
    paddingTop: ui.menuGutterVertical,
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
    lineHeight: '1.5rem',
    marginBottom: ui.menuGutterVertical,
    padding: `0 ${ui.menuGutterHorizontal} ${ui.menuGutterVertical}`
  }
});

export default portal({escToClose: true, clickToClose: true})(withStyles(styleThunk)(Menu));
