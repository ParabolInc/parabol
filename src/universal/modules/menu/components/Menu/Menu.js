// @flow
import type {Node} from 'react';

import React, { Children, cloneElement, Component } from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import portal from 'react-portal-hoc';
import Spinner from '../../../spinner/components/Spinner/Spinner';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

type Props = {
  children?: Node,
  closePortal: () => void,
  coords: Object,
  focusOnMount?: boolean,
  isLoaded: boolean,
  itemFactory: () => Node[],
  label: string,
  menuOrientation: 'left' | 'right',
  maxHeight: string,
  menuWidth: string,
  styles: Object,
  toggle: any,
  verticalAlign: 'middle' | 'top',
  zIndex: string
};

class Menu extends Component<Props> {
  static defaultProps = {
    menuOrientation: 'left',
    verticalAlign: 'middle'
  };

  componentDidMount() {
    if (this.props.focusOnMount && this.menuEl) {
      this.previouslyFocusedEl = document.activeElement;
      this.menuEl.focus();
    }
  }

  menuEl: ?HTMLElement;
  previouslyFocusedEl: ?HTMLElement;

  focusItem = (indexDifference) => {
    if (!this.menuEl) {
      return;
    }
    const menuItemEls = Array.from(this.menuEl.querySelectorAll('[role="menuitem"]'));
    if (!menuItemEls.length) {
      return;
    }
    const currentFocusIndex = menuItemEls.findIndex((itemEl) => itemEl === document.activeElement);
    const nextFocusIndex = currentFocusIndex + indexDifference;
    if (currentFocusIndex < 0) {
      menuItemEls[0].focus();
      return;
    }
    if (nextFocusIndex >= 0 && nextFocusIndex < menuItemEls.length) {
      menuItemEls[nextFocusIndex].focus();
    }
  };

  focusNextItem = () => {
    this.focusItem(1);
  };

  focusPreviousItem = () => {
    this.focusItem(-1);
  };

  saveMenuEl = (menuEl) => {
    this.menuEl = menuEl;
  };

  restorePreviousFocus = () => {
    if (this.previouslyFocusedEl) {
      this.previouslyFocusedEl.focus();
    }
  };

  handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem();
        break;
      case 'Tab':
      case 'Escape':
        this.props.closePortal();
        this.restorePreviousFocus();
        break;
      default:
        break;
    }
  };

  render() {
    const {
      children,
      closePortal,
      coords,
      isLoaded,
      itemFactory,
      label,
      menuWidth,
      styles
    } = this.props;
    const menuBlockStyle = {
      width: menuWidth,
      ...coords
    };
    const kids = Children.map(itemFactory && itemFactory() || children, (child) => cloneElement(child, {closePortal}));
    return (
      <div className={css(styles.menuBlock)} style={menuBlockStyle}>
        <div
          className={css(styles.menu)}
          role="menu"
          tabIndex="-1"
          onKeyDown={this.handleKeyDown}
          ref={this.saveMenuEl}
        >
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
  }
}

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
