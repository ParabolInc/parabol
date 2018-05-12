import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import styled, {css, cx} from 'react-emotion';
import textOverflow from 'universal/styles/helpers/textOverflow';

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
  '&:hover,:focus': {
    backgroundColor: ui.menuItemBackgroundColorActive
  }
});

const Label = styled('div')(({hasIcon, disabled}) => ({
  ...textOverflow,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  padding: `0 ${ui.menuGutterHorizontal}`,
  paddingLeft: hasIcon && 0,
  color: disabled && 'grey'
}));

class MenuItemWithShortcuts extends Component {
  static propTypes = {
    activate: PropTypes.func,
    avatar: PropTypes.string,
    children: PropTypes.any,
    closePortal: PropTypes.func,
    disabled: PropTypes.bool,
    hasDotIcon: PropTypes.bool,
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

  componentDidMount () {
    const {isActive} = this.props;
    if (isActive) {
      this.itemRef.scrollIntoViewIfNeeded();
    }
  }
  componentWillReceiveProps (nextProps) {
    const {isActive} = nextProps;
    if (isActive && !this.props.isActive) {
      this.itemRef.scrollIntoViewIfNeeded();
    }
  }

  handleClick = (e) => {
    const {activate, noCloseOnClick, closePortal, onClick} = this.props;
    if (noCloseOnClick) {
      activate();
    } else if (closePortal) {
      closePortal();
    }
    if (onClick) {
      onClick(e);
    }
  };

  render () {
    const {
      avatar,
      children,
      disabled,
      hasDotIcon,
      icon,
      iconColor,
      isActive,
      label,
      menuRef,
      title
    } = this.props;
    const labelEl =
      typeof label === 'string' ? (
        <Label hasIcon={Boolean(avatar || icon)} disabled={disabled}>
          {label}
        </Label>
      ) : (
        label
      );
    const titleFallbackStr = typeof label === 'string' ? label : 'Menu Item';
    const titleStr = title || titleFallbackStr;
    const makeDot = () => (
      <div
        className={css({
          backgroundColor: iconColor || 'inherit',
          borderRadius: '.375rem',
          height: '.375rem',
          marginLeft: ui.menuGutterHorizontal,
          marginRight: ui.menuGutterInner,
          width: '.375rem'
        })}
      />
    );
    const makeIcon = () => (
      <FontAwesome
        name={icon}
        className={css({
          color: iconColor || ui.menuItemIconColor,
          fontSize: ui.iconSize,
          lineHeight: 'inherit',
          marginLeft: ui.menuGutterHorizontal,
          marginRight: ui.menuGutterInner,
          textAlign: 'center',
          width: '1.25rem'
        })}
      />
    );
    const makeAvatar = () => (
      <img
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
      />
    );
    return (
      <div
        role="menuitem"
        title={titleStr}
        ref={(c) => {
          this.itemRef = c;
        }}
        className={cx(rootStyle, isActive && activeStyle)}
        onClick={this.handleClick}
      >
        {avatar && makeAvatar()}
        {!avatar && icon && !hasDotIcon && makeIcon()}
        {!avatar && hasDotIcon && makeDot()}
        {children ? React.cloneElement(children, {isActive, menuRef}) : labelEl}
      </div>
    );
  }
}

export default MenuItemWithShortcuts;
