import PropTypes from 'prop-types';
import React, {Children, cloneElement, Component} from 'react';
import {css} from 'react-emotion';

const isValidMenuItem = (menuItem) => {
  return menuItem && typeof menuItem.type !== 'string' && menuItem.type.name === 'MenuItemWithShortcuts';
};

class MenuWithShortcuts extends Component {
  static propTypes = {
    ariaLabel: PropTypes.string,
    children: PropTypes.any.isRequired,
    closePortal: PropTypes.func.isRequired
  };

  state = {
    active: null
  }

  componentWillMount() {
    const {children} = this.props;
    const childArr = Children.toArray(children);
    const startIdx = childArr.findIndex((child) => isValidMenuItem(child));
    this.state.active = startIdx;
  }

  componentDidMount() {
    this.menuRef.focus();
  }

  setActiveIndex = (idx) => {
    const {active} = this.state;
    const children = Children.toArray(this.props.children);
    let nextIdx;
    if (active < idx) {
      for (let ii = idx; ii < children.length; ii++) {
        const nextChild = children[ii];
        if (isValidMenuItem(nextChild)) {
          nextIdx = ii;
          break;
        }
      }
    } else if (active > idx) {
      for (let ii = idx; ii >= 0; ii--) {
        const nextChild = children[ii];
        if (isValidMenuItem(nextChild)) {
          nextIdx = ii;
          break;
        }
      }
    }
    if (nextIdx === null || nextIdx === undefined || nextIdx === active || nextIdx < 0 || nextIdx >= children.length) return;
    this.setState({
      active: nextIdx
    });
  }

  makeSmartChildren(children, active) {
    const {closePortal} = this.props;
    return Children.map(children, (child, idx) => {
      if (isValidMenuItem(child)) {
        const activate = () => this.setActiveIndex(idx);
        return cloneElement(child, {closePortal, isActive: active === idx, menuRef: this.menuRef, activate});
      }
      return child;
    });
  }

  handleKeyDown = (e) => {
    const {active} = this.state;
    const {children} = this.props;
    const {closePortal} = this.props;
    let handled;
    if (e.key === 'ArrowDown') {
      handled = true;
      this.setActiveIndex(active + 1);
    } else if (e.key === 'ArrowUp') {
      handled = true;
      this.setActiveIndex(active - 1);
    } else if (e.key === 'Enter') {
      const smartChild = Children.toArray(children)[active];
      if (smartChild && smartChild.props.onClick) {
        handled = true;
        smartChild.props.onClick();
        closePortal(e);
      }
    } else if (e.key === 'Tab') {
      handled = true;
      closePortal(e);
    }
    if (handled) {
      e.preventDefault();
    }
  };

  render() {
    const {ariaLabel, children} = this.props;
    const {active} = this.state;
    return (
      <div
        role="menu"
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={this.handleKeyDown}
        ref={(c) => { this.menuRef = c; }}
        className={css({outline: 0})}
      >
        {this.makeSmartChildren(children, active)}
      </div>
    );
  }
}

export default MenuWithShortcuts;
