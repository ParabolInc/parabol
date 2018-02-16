import PropTypes from 'prop-types';
import React, {Children, cloneElement, Component} from 'react';
import {css} from 'react-emotion';

const isValidMenuItem = (menuItem) => {
  return menuItem && menuItem.type.name === 'MenuItemWithShortcuts';
};

class MenuWithShortcuts extends Component {
  static propTypes = {
    ariaLabel: PropTypes.string,
    children: PropTypes.any.isRequired,
    closePortal: PropTypes.func.isRequired
  };

  state = {
    active: -1,
    smartChildren: []
  }

  componentDidMount() {
    const {children} = this.props;
    this.state.smartChildren = this.makeSmartChildren(children, 0);
    const childArr = Children.toArray(children);
    const startIdx = childArr.findIndex((child) => isValidMenuItem(child));
    this.state.active = startIdx;
    this.menuRef.focus();
  }

  componentWillReceiveProps(nextProps) {
    const {children} = nextProps;
    if (this.props.children !== children) {
      this.setState({
        smartChildren: this.makeSmartChildren(children, this.state.active)
      });
    }
  }

  setActiveIndex = (idx) => {
    const {active, smartChildren} = this.state;
    let nextIdx;
    if (active < idx) {
      for (let ii = idx; ii < smartChildren.length; ii++) {
        const nextChild = smartChildren[ii];
        if (isValidMenuItem(nextChild)) {
          nextIdx = ii;
          break;
        }
      }
    } else if (active > idx) {
      for (let ii = idx; ii >= 0; ii--) {
        const nextChild = smartChildren[ii];
        if (isValidMenuItem(nextChild)) {
          nextIdx = ii;
          break;
        }
      }
    }
    if (nextIdx === null || nextIdx === undefined || nextIdx === active || nextIdx < 0 || nextIdx >= smartChildren.length) return;
    this.setState({
      active: nextIdx,
      smartChildren: this.makeSmartChildren(this.props.children, nextIdx)
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
    const {active, smartChildren} = this.state;
    const {closePortal} = this.props;
    let handled;
    if (e.key === 'ArrowDown') {
      handled = true;
      this.setActiveIndex(active + 1);
    } else if (e.key === 'ArrowUp') {
      handled = true;
      this.setActiveIndex(active - 1);
    } else if (e.key === 'Enter') {
      const smartChild = smartChildren[active];
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
    const {ariaLabel} = this.props;
    const {smartChildren} = this.state;
    return (
      <div
        role="menu"
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={this.handleKeyDown}
        ref={(c) => { this.menuRef = c; }}
        className={css({outline: 0})}
      >
        {smartChildren}
      </div>
    );
  }
}

export default MenuWithShortcuts;
