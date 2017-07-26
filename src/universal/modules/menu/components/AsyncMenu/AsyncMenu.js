import PropTypes from 'prop-types';
import React, { Children, cloneElement } from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import portal from 'react-portal-hoc';
import Spinner from '../../../spinner/components/Spinner/Spinner';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Menu from 'universal/modules/menu/components/Menu/Menu';

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

export default class MenuContainer extends Component {
  static propTypes = {
    isLoaded: PropTypes.bool,
    originAnchor: PropTypes.object,
    targetAnchor: PropTypes.object,
    toggle: PropTypes.object
  };

  constructor() {
    super();
    this.state = {};
  }

  makeSmartToggle = () => {
    const {toggle, originAnchor, targetAnchor, toggleMargin, maxWidth, maxHeight} = this.props;
    return React.cloneElement(toggle, {
      onClick: (e) => {
        // always set coords, otherwise we'd have to intercept all calls to closePortal to keep coords at null & window resize events
        // figure out where to put the menu
        const rect = e.target.getBoundingClientRect();
        const {vertical: originY, horizontal: originX} = originAnchor;
        const {height, width, left, top} = rect;
        let left = window.scrollY
        if (targetAnchor.horizontal === 'left') {
          if (originAnchor.horizontal === 'left') {
            left = rect.left;
          } else if (originAnchor.horizontal === 'center') {
            left = rect.left + rect.width / 2;
          } else if (originAnchor.horizontal === 'right') {
            left = rect.left + rect.width;
          }
        } else if (targetAnchor.horizontal === 'center') {
          if (originAnchor.horizontal === 'left') {
            left = rect.left - maxWidth / 2
          } else if (originAnchor.horizontal === 'center') {
            left = rect.left + rect.width / 2 - maxWidth / 2
          } else if (originAnchor.horizontal === 'right') {
            left = rect.left + rect.width - maxWidth / 2
          }
        } else if (targetAnchor.horizontal === 'right') {
          if (originAnchor.horizontal === 'left') {
            left = rect.left - maxWidth
          } else if (originAnchor.horizontal === 'center') {
            left = rect.left + rect.width / 2 - maxWidth
          } else if (originAnchor.horizontal === 'right') {
            left = rect.left + rect.width - maxWidth
          }
        }
        this.setState({
          left:
          coords: {
            [targetAnchor.vertical]: calculateMenuPosY(height, top, originY, targetAnchor.vertical),
            [targetAnchor.horizontal]: calculateMenuPosX(width, left, originX, targetAnchor.horizontal)
          }
        });
        const {onClick} = toggle.props;
        if (onClick) {
          // if the menu was gonna do something, do it
          onClick(e);
        }
      }
    });
  }
  render() {
    const {originAnchor, targetAnchor, toggle} = this.props;
    console.log('render menu', toggle);

    return (
      <Menu
        {...this.props}
        coords={this.state.coords}
        toggle={smartToggle}
      />
    );
  }
}


const Menu = (props) => {
  const {
    children,
    closePortal,
    coords,
    isLoaded,
    itemFactory,
    label,
    menuWidth,
    styles
  } = props;
  const menuBlockStyle = {
    width: menuWidth,
    ...coords
  };
  console.log('render innerMenu');
  const kids = Children.map(itemFactory && itemFactory() || children, (child) => cloneElement(child, {closePortal}));
  console.log('getkids', kids)
  return (
    <div className={css(styles.menuBlock)} style={menuBlockStyle}>
      <div className={css(styles.menu)}>
        {label && <div className={css(styles.label)}>{label}</div>}
        {kids}
        <ReactCSSTransitionGroup
          transitionName={{
            appear: css(styles.spinnerAppear),
            appearActive: css(styles.spinnerAppearActive)
          }}
          transitionAppear
          transitionEnter={false}
          transitionLeave={false}
          transitionAppearTimeout={300}
        >
          {
            kids.length === 0 && !isLoaded &&
            <div key="spinner" className={css(styles.spinner)}>
              <Spinner fillColor="cool" width={40} />
            </div>
          }
        </ReactCSSTransitionGroup>
      </div>
    </div>
  );
};

Menu.defaultProps = {
  menuOrientation: 'left',
  verticalAlign: 'middle'
};

Menu.propTypes = {
  children: PropTypes.any,
  closePortal: PropTypes.func,
  coords: PropTypes.object,
  isLoaded: PropTypes.bool,
  itemFactory: PropTypes.func,
  label: PropTypes.string,
  menuOrientation: PropTypes.oneOf([
    'left',
    'right'
  ]),
  maxHeight: PropTypes.string,
  menuWidth: PropTypes.string,
  styles: PropTypes.object,
  toggle: PropTypes.any,
  verticalAlign: PropTypes.oneOf([
    'middle',
    'top'
  ]),
  zIndex: PropTypes.string
};

const styleThunk = (theme, {maxHeight}) => ({
  menuBlock: {
    paddingTop: '.25rem',
    position: 'absolute',
    zIndex: ui.ziMenu
  },

  menu: {
    backgroundColor: ui.menuBackgroundColor,
    borderRadius: ui.menuBorderRadius,
    boxShadow: ui.menuBoxShadow,
    maxHeight: maxHeight || '10rem',
    outline: 0,
    overflowY: 'auto',
    paddingBottom: ui.menuGutterVertical,
    paddingTop: ui.menuGutterVertical,
    textAlign: 'left',
    width: '100%'
  },

  label: {
    ...textOverflow,
    borderBottom: `1px solid ${appTheme.palette.mid30l}`,
    color: ui.palette.dark,
    fontSize: ui.menuItemFontSize,
    fontWeight: 700,
    lineHeight: ui.menuItemHeight,
    marginBottom: ui.menuGutterVertical,
    padding: `0 ${ui.menuGutterHorizontal}`
  },

  spinner: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '3rem',
    width: '100%'
  },

  spinnerAppear: {
    opacity: 0,
    transform: 'translate3d(0, 10px, 0)'
  },

  spinnerAppearActive: {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: 'all 300ms ease-in'
  }
});

export default portal({escToClose: true, clickToClose: true})(withStyles(styleThunk)(Menu));
