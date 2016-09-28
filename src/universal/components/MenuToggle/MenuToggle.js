import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';

let styles = {};

@look
export default class MenuToggle extends Component {
  static propTypes = {
    children: PropTypes.any,
    menuPosition: PropTypes.oneOf([
      'left',
      'right'
    ]),
    menuWidth: PropTypes.string,
    toggle: PropTypes.any
  }

  static defaultProps = {
    menuPosition: 'left',
    menuWidth: '12rem',
    toggle: 'Toggle Menu'
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
      menuPosition,
      menuWidth,
      toggle
    } = this.props;

    const toggleMenu = () =>
      this.setState({open: !this.state.open});

    const menuBlockStyle = {
      [menuPosition]: 0,
      width: menuWidth
    };

    const toggleStyle = this.state.open ? {opacity: '.5'} : null;

    return (
      <div className={styles.root}>
        <div className={styles.toggle} onClick={toggleMenu} style={toggleStyle}>{toggle}</div>
        {this.state.open &&
          <div className={styles.menuBlock} style={menuBlockStyle}>
            {children}
          </div>
        }
      </div>
    );
  }
}

styles = StyleSheet.create({
  root: {
    display: 'inline-block',
    position: 'relative',
    verticalAlign: 'middle'
  },

  toggle: {
    cursor: 'pointer',
    lineHeight: '1.5',
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
