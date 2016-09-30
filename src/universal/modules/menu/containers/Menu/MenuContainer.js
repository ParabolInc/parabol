import {findDOMNode} from 'react-dom';
import React, {Component, PropTypes, cloneElement} from 'react';
import {connect} from 'react-redux';
import Menu from 'universal/modules/menu/components/Menu/Menu';
import targetIsDescendant from 'universal/utils/targetIsDescendant';
import {setMenu} from 'universal/modules/menu/ducks/menuDuck';

const mapStateToProps = (state, props) => {
  const {menuKey} = props;
  const menuState = state.menu[menuKey];
  return {
    isOpen: menuState && menuState.isOpen
  }
};

const bindChildren = (children, propsToAdd) => {
  const boundChildren = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    boundChildren[i] = cloneElement(child, propsToAdd);
  }
  return boundChildren;
};

@connect(mapStateToProps)
export default class MenuContainer extends Component {
  static propTypes = {
    children: PropTypes.any,
    dispatch: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    label: PropTypes.string,
    menuKey: PropTypes.string.isRequired,
    menuOrientation: PropTypes.oneOf([
      'left',
      'right'
    ]),
    menuWidth: PropTypes.string,
    toggle: PropTypes.any,
    toggleHeight: PropTypes.string,
    verticalAlign: PropTypes.oneOf([
      'middle',
      'top'
    ]),
  };

  closeMenu = () => {
    const {dispatch, menuKey} = this.props;
    dispatch(setMenu(menuKey, false));
  };

  toggleMenu = () => {
    const {dispatch, isOpen, menuKey} = this.props;
    dispatch(setMenu(menuKey, !isOpen));
  };

  componentWillUpdate(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) {
      document.addEventListener('click', this.handleDocumentClick);
    } else if (this.props.isOpen && !nextProps.isOpen) {
      document.removeEventListener('click', this.handleDocumentClick);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  handleDocumentClick = (e) => {
    // close as long as they didn't click the toggle
    if (this.props.isOpen && !targetIsDescendant(e.target, findDOMNode(this))) {
      this.closeMenu();
    }
  };

  render() {
    const {
      children,
      dispatch,
      isOpen,
      label,
      menuKey,
      menuOrientation,
      menuWidth,
      toggle,
      toggleHeight,
      verticalAlign
    } = this.props;
    return (
      <Menu
        children={bindChildren(children, {closeMenu: this.closeMenu})}
        dispatch={dispatch}
        isOpen={isOpen}
        label={label}
        menuKey={menuKey}
        menuOrientation={menuOrientation}
        menuWidth={menuWidth}
        toggle={toggle}
        toggleHeight={toggleHeight}
        toggleMenu={this.toggleMenu}
        verticalAlign={verticalAlign}
      />
    );
  }
};
