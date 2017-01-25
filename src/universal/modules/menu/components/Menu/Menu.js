import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import Portal from 'react-portal';

const calculateMenuPosY = (originHeight, originTop, orientation, targetOrientation) => {
  let topOffset = originTop + window.scrollY;
  if (orientation === 'center') {
    topOffset += originHeight / 2;
  } else if (orientation === 'bottom') {
    topOffset += originHeight;
  }
  return targetOrientation === 'bottom' ? document.body.clientHeight - topOffset : topOffset;
};

const calculateMenuPosX = (originWidth, originLeft, orientation, targetOrientation) => {
  let leftOffset = originLeft + window.scrollX;
  if (orientation === 'center') {
    leftOffset += originWidth / 2;
  } else if (orientation === 'right') {
    leftOffset += originWidth;
  }
  return targetOrientation === 'right' ? document.body.clientWidth - leftOffset : leftOffset;
};

const Menu = (props) => {
  const {
    originAnchor,
    targetAnchor,
    children,
    label,
    menuWidth,
    styles,
    toggle,
    coords,
    setPosition
  } = props;

  const smartToggle = React.cloneElement(toggle, {
    onMouseEnter: (e) => {
      const rect = e.target.getBoundingClientRect();
      const {vertical: originY, horizontal: originX} = originAnchor;
      const {height, width, left, top} = rect;
      setPosition({
        [targetAnchor.vertical]: calculateMenuPosY(height, top, originY, targetAnchor.vertical),
        [targetAnchor.horizontal]: calculateMenuPosX(width, left, originX, targetAnchor.horizontal)
      });
    }
  });
  const menuBlockStyle = {
    width: menuWidth,
    ...coords
  };

  const boxShadow = '0 1px 1px rgba(0, 0, 0, .15)';
  const menuStyle = {boxShadow};
  return (
    <div>
      <Portal closeOnEsc closeOnOutsideClick openByClickOn={smartToggle}>
        <div className={css(styles.menuBlock)} style={menuBlockStyle}>
          <div
            className={css(styles.menu)}
            style={menuStyle}
          >
            <div className={css(styles.label)}>{label}</div>
            {children}
          </div>
        </div>
      </Portal>
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

export default withStyles(styleThunk)(Menu);
