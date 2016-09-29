import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';

let styles = {};

@look
export default class MenuToggle extends Component {
  static propTypes = {
    children: PropTypes.any,
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
  }

  static defaultProps = {
    menuOrientation: 'left',
    menuWidth: '12rem',
    toggle: 'Toggle Menu',
    verticalAlign: 'middle'
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const {
      children,
      menuOrientation,
      menuWidth,
      toggle,
      toggleHeight,
      verticalAlign
    } = this.props;

    const toggleMenu = () => {
      this.setState({open: !this.state.open});
    };

    const closeMenu = () => {
      this.setState({open: false});
    };

    const toggleHeightStyle = {
      height: toggleHeight,
      lineHeight: toggleHeight,
      verticalAlign
    };

    const menuBlockStyle = {
      [menuOrientation]: 0,
      width: menuWidth
    };

    const toggleStyle = this.state.open ? {opacity: '.5'} : null;

    const rootStyle = toggleHeight ? toggleHeightStyle : {verticalAlign};

    return (
      <div className={styles.root} style={rootStyle}>
        <div className={styles.toggle} onClick={toggleMenu} style={{...rootStyle, ...toggleStyle}}>{toggle}</div>
        {this.state.open &&
          <div className={styles.menuBlock} style={menuBlockStyle}>
            {React.cloneElement(children, {closeMenu})}
          </div>
        }
      </div>
    );
  }
}

styles = StyleSheet.create({
  root: {
    display: 'inline-block',
    position: 'relative'
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
    position: 'absolute',
    top: '100%'
  }
});
