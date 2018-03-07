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
    active: null,
    smartChildren: null
  }

  componentWillMount() {
    const {children} = this.props;
    const smartChildren = this.makeSmartChildren(children);
    const childArr = Children.toArray(smartChildren);
    const startIdx = childArr.findIndex((child) => isValidMenuItem(child));
    this.state.active = startIdx;
    this.state.smartChildren = smartChildren;
  }

  componentDidMount() {
    this.menuRef.focus();
  }

  componentWillReceiveProps(nextProps) {
    const {children} = nextProps;
    if (children !== this.props.children) {
      this.setState({
        smartChildren: this.makeSmartChildren(children)
      });
    }
  }

  setActiveIndex = (idx) => {
    const {active, smartChildren} = this.state;
    const children = Children.toArray(smartChildren);
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

  makeSmartChildren(children) {
    const {closePortal} = this.props;
    const {active} = this.state;
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
      const smartChild = Children.toArray(smartChildren)[active];
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
