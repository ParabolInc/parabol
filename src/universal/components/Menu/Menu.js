/**
 * A composable, accessible dropdown menu.
 *
 * @flow
 */

import type { Element, Node } from 'react';

import { css } from 'aphrodite-local-styles/no-important';
import React, { Children, Component, cloneElement } from 'react';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import { textOverflow } from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

// TYPES
type MenuProps = {
  children: Node,
  styles: Object,
  toggle: Element<*>
};

type MenuState = {
  isOpen: boolean
};

type MenuItemProps = { children: Node };

type MenuItemButtonProps = {
  closeMenu: () => void,
  onClick?: () => any,
  children: Node,
  menuWidth?: number,
  styles: Object
};

type MenuLabelProps = { children: Node, styles: Object };

// STYLES
const activeItemStyles = {
  backgroundColor: ui.menuItemBackgroundColorActive,
  cursor: 'pointer'
};

const styleThunk = (_, props: MenuProps) => ({
  // A label at the top of a menu
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

  // The element with role="menu"
  menu: {
    backgroundColor: ui.menuBackgroundColor,
    borderRadius: ui.menuBorderRadius,
    boxShadow: ui.menuBoxShadow,
    maxHeight: '10rem',
    outline: 0,
    overflowY: 'auto',
    paddingBottom: ui.menuGutterVertical,
    paddingTop: ui.menuGutterVertical,
    position: 'absolute',
    right: 0,
    textAlign: 'left',
    width: props.menuWidth || '100%',
    zIndex: ui.ziTooltip
  },

  // The top-level container
  menuContainer: {
    position: 'relative'
  },

  // Menu items
  menuItem: {
    ...textOverflow,
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal}`,
    transition: `background-color ${ui.transition[0]}`,

    ':hover': activeItemStyles,
    ':focus': activeItemStyles
  },

  // Buttons within menu items
  menuButton: {
    textAlign: 'left',
    width: '100%'
  }
});

export const MenuLabel = withStyles(styleThunk)(
  (props: MenuLabelProps) => (
    <div className={css(props.styles.label)}>
      {props.children}
    </div>
  )
);

export const MenuItem = (props: MenuItemProps) => (
  <div role="menuitem" tabIndex="-1">
    {props.children}
  </div>
);

export const MenuItemButton = withStyles(styleThunk)(
  (props: MenuItemButtonProps) => (
    <PlainButton
      {...props}
      onClick={() => {
        props.closeMenu();
        if (props.onClick) {
          props.onClick();
        }
      }}
      role="menuitem"
      tabIndex="-1"
      extraStyles={[props.styles.menuItem, props.styles.menuButton]}
    >
      {props.children}
    </PlainButton>
  )
);

class Menu extends Component<MenuProps, MenuState> {
  state = { isOpen: false };

  componentDidMount() {
    this.previouslyFocusedEl = document.activeElement;
  }

  componentDidUpdate() {
    if (this.state.isOpen) {
      this.focusMenu();
    }
  }

  menuEl: ?HTMLElement = null;
  previouslyFocusedEl: ?HTMLElement;

  focusMenu = () => {
    if (this.menuEl) {
      this.menuEl.focus();
    }
  };

  focusItem = (indexDifference: number) => {
    if (!this.state.isOpen || !this.menuEl) {
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

  handleMenuKeyDown = (event: KeyboardEvent) => {
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
        this.toggleOpen();
        this.restorePreviousFocus();
        break;
      default:
        break;
    }
  };

  restorePreviousFocus = () => {
    if (this.previouslyFocusedEl) {
      this.previouslyFocusedEl.focus();
    }
  };

  toggleOpen = () => {
    this.setState(({ isOpen }) => ({ isOpen: !isOpen }));
  };

  close = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const { children, styles, toggle } = this.props;
    const { isOpen } = this.state;
    const a11yToggle = cloneElement(toggle, {
      'aria-haspopup': true,
      onClick: () => {
        this.toggleOpen();
        if (toggle.props.onClick) {
          toggle.props.onClick();
        }
      }
    });
    const childrenWithCloseProp = Children.map(children, (child) => cloneElement(child, { closeMenu: this.close }));
    return (
      <div className={css(styles.menuContainer)}>
        {a11yToggle}
        {isOpen && (
          <div
            role="menu"
            tabIndex="-1"
            className={css(styles.menu)}
            ref={(el) => {
              this.menuEl = el;
            }}
            onKeyDown={this.handleMenuKeyDown}
          >
            {childrenWithCloseProp}
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(styleThunk)(Menu);
