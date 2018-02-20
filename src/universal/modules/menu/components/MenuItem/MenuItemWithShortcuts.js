import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import {css, cx} from 'react-emotion';

const rootStyle = css({
  alignItems: 'center',
  backgroundColor: ui.menuBackgroundColor,
  color: ui.menuItemColor,
  cursor: 'pointer',
  display: 'flex',
  transition: `background-color ${ui.transition[0]}`,
  '&:hover,:focus': {
    backgroundColor: ui.menuItemBackgroundColorHover,
    color: ui.menuItemColorHoverActive,
    outline: 0
  }
});

const activeStyle = css({
  backgroundColor: ui.menuItemBackgroundColorActive,
  color: ui.menuItemColorHoverActive,
  cursor: 'default',
  '&:hover,:focus': {
    backgroundColor: ui.menuItemBackgroundColorActive
  }
});

const labelStyle = css({
  ...textOverflow,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  padding: `0 ${ui.menuGutterHorizontal}`
});

const iconLabelStyle = css({
  paddingLeft: 0
});

class MenuItemWithShortcuts extends Component {
  static propTypes = {
    activate: PropTypes.func,
    avatar: PropTypes.string,
    children: PropTypes.any,
    closePortal: PropTypes.func,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    isActive: PropTypes.bool,
    label: PropTypes.any,
    menuRef: PropTypes.instanceOf(Element),
    noCloseOnClick: PropTypes.bool,
    onClick: PropTypes.func,
    styles: PropTypes.object,
    title: PropTypes.string
  };

  componentWillReceiveProps(nextProps) {
    const {isActive} = nextProps;
    if (isActive && !this.props.isActive) {
      this.itemRef.scrollIntoViewIfNeeded();
    }
  }

  handleClick = () => {
    const {
      activate,
      noCloseOnClick,
      closePortal,
      onClick
    } = this.props;
    if (noCloseOnClick) {
      activate();
    } else if (closePortal) {
      closePortal();
    }
    if (onClick) {
      onClick();
    }
  };

  render() {
    const {
      avatar,
      children,
      icon,
      iconColor,
      isActive,
      label,
      menuRef,
      title
    } = this.props;
    const labelEl = typeof label === 'string' ?
      <div className={cx(labelStyle, (avatar || icon) && iconLabelStyle)}>{label}</div> : label;
    const titleFallbackStr = typeof label === 'string' ? label : 'Menu Item';
    const titleStr = title || titleFallbackStr;
    const makeIcon = () =>
      (<FontAwesome
        name={icon}
        className={css({
          color: iconColor || 'inherit',
          fontSize: ui.iconSize,
          lineHeight: 'inherit',
          marginLeft: ui.menuGutterHorizontal,
          marginRight: ui.menuGutterInner,
          textAlign: 'center',
          width: '1.25rem'
        })}
      />);
    const makeAvatar = () =>
      (<img
        alt={titleStr}
        className={css({
          borderRadius: '100%',
          height: '1.5rem',
          marginLeft: ui.menuGutterHorizontal,
          marginRight: ui.menuGutterInner,
          minWidth: '1.5rem',
          width: '1.5rem'
        })}
        src={avatar}
      />);
    return (
      <div
        role="menuitem"
        title={titleStr}
        ref={(c) => { this.itemRef = c; }}
        className={cx(rootStyle, isActive && activeStyle)}
        onClick={this.handleClick}
      >
        {avatar && makeAvatar()}
        {!avatar && icon && makeIcon()}
        {children ? React.cloneElement(children, {isActive, menuRef}) : labelEl}
      </div>
    );
  }
}

export default MenuItemWithShortcuts;
