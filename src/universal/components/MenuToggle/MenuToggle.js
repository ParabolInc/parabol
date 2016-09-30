import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';

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
      label,
      menuOrientation,
      menuWidth,
      toggle,
      toggleHeight,
      verticalAlign
    } = this.props;

    const openMenu = () => {
      if (!this.state.open) {
        this.setState({open: true});
      }
    };

    const closeMenu = () => {
      // allow the open trigger to fire 1 frame before this one does
      setTimeout(() => this.setState({open: false}), 13);
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
    const boxShadow = '0 1px 1px rgba(0, 0, 0, .15)';
    const menuStyle = {boxShadow};
    return (
      <div className={styles.root} style={rootStyle}>
        <div className={styles.toggle} onClick={openMenu} style={{...rootStyle, ...toggleStyle}}>{toggle}</div>
        {this.state.open &&
        <div className={styles.menuBlock} style={menuBlockStyle}>
          <div
            ref={(c) => c && c.focus()}
            className={styles.menu}
            style={menuStyle}
            tabIndex="0"
            onBlur={closeMenu}
          >
            <div className={styles.label}>{label}</div>
            {children}
          </div>
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
  },
  menu: {
    backgroundColor: ui.menuBackgroundColor,
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.25rem',
    padding: '0 0 .5rem',
    textAlign: 'left',
    width: '100%',
    outline: 0
  },

  label: {
    ...textOverflow,
    borderBottom: `1px solid ${theme.palette.mid30l}`,
    color: theme.palette.mid,
    fontSize: theme.typography.s2,
    fontWeight: 700,
    lineHeight: 1,
    padding: '.5rem'
  }
});
