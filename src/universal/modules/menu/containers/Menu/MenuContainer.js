import {findDOMNode} from 'react-dom';
import React, {Children, Component, PropTypes, cloneElement} from 'react';
import {connect} from 'react-redux';
import Menu from 'universal/modules/menu/components/Menu/Menu';
import targetIsDescendant from 'universal/utils/targetIsDescendant';
import {setMenu} from 'universal/modules/menu/ducks/menuDuck';

const mapStateToProps = (state, props) => {
  const {menuKey} = props;
  const menuState = state.menu[menuKey];
  return {
    isOpen: menuState && menuState.isOpen
  };
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
    zIndex: PropTypes.string
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

  closeMenu = () => {
    const {dispatch, menuKey} = this.props;
    dispatch(setMenu(menuKey, false));
  };

  toggleMenu = () => {
    const {dispatch, isOpen, menuKey} = this.props;
    dispatch(setMenu(menuKey, !isOpen));
  };

  handleDocumentClick = (e) => {
    // close as long as they didn't click the toggle
    if (this.props.isOpen && !targetIsDescendant(e.target, findDOMNode(this))) {
      this.closeMenu();
    }
  };

  render() {
    const {children} = this.props;
    const properChildren = Children.map(children, child => cloneElement(child, {closeMenu: this.closeMenu}));
    return (
      <Menu
        {...this.props}
        children={properChildren}
        toggleMenu={this.toggleMenu}
      />
    );
  }
}
