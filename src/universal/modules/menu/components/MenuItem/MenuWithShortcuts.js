import PropTypes from 'prop-types';
import React, {Children, cloneElement, Component} from 'react';
import styled from 'react-emotion';

const isValidMenuItem = (menuItem) => {
  // since uglifier takes away the type name, you must pass in a notMenuItem boolean to a non-menu-item component
  return menuItem && typeof menuItem.type !== 'string' && !menuItem.props.notMenuItem;
};

const MenuStyles = styled('div')({
  outline: 0,
  // VERY important! If not present, draft-js gets confused & thinks the menu is the selection rectangle
  userSelect: 'none'
});

class MenuWithShortcuts extends Component {
  static propTypes = {
    ariaLabel: PropTypes.string,
    children: PropTypes.any.isRequired,
    closePortal: PropTypes.func.isRequired,
    defaultActiveIdx: PropTypes.number,
    keepParentFocus: PropTypes.bool
  };

  state = {
    active: null
  }

  componentWillMount() {
    const {children, defaultActiveIdx} = this.props;
    const childArr = Children.toArray(children);
    this.state.active = defaultActiveIdx || childArr.findIndex((child) => isValidMenuItem(child));
  }

  componentDidMount() {
    if (!this.props.keepParentFocus) {
      this.menuRef.focus();
    }

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
        } else {
          // if we're at the top & there's a header, put the header into view
          this.menuRef.scrollIntoView();
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
      <MenuStyles
        role="menu"
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={this.handleKeyDown}
        innerRef={(c) => { this.menuRef = c; }}
      >
        {this.makeSmartChildren(children, active)}
      </MenuStyles>
    );
  }
}

export default MenuWithShortcuts;
