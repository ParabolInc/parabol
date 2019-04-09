/* Deprecated. See MenuItem */
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import MenuItemIcon from 'universal/components/MenuItemIcon'
import MenuItemDot from 'universal/components/MenuItemDot'
import MenuItemAvatar from 'universal/components/MenuItemAvatar'

const MenuItem = styled('div')(({isActive}) => ({
  alignItems: 'center',
  backgroundColor: isActive ? ui.menuItemBackgroundColorActive : ui.menuBackgroundColor,
  color: isActive ? ui.menuItemColorHoverActive : ui.menuItemColor,
  cursor: 'pointer',
  display: 'flex',
  transition: `background-color ${ui.transition[0]}`,
  '&:hover,:focus': {
    backgroundColor: isActive ? ui.menuItemBackgroundColorActive : ui.menuItemBackgroundColorHover,
    color: ui.menuItemColorHoverActive,
    outline: 0
  }
}))

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
    menuRef: PropTypes.instanceOf(window.Element),
    noCloseOnClick: PropTypes.bool,
    onClick: PropTypes.func,
    styles: PropTypes.object,
    title: PropTypes.string
  }

  componentDidMount () {
    const {isActive} = this.props
    if (isActive && this.itemRef) {
      this.itemRef.scrollIntoViewIfNeeded()
    }
  }

  componentWillReceiveProps (nextProps) {
    const {isActive} = nextProps
    if (isActive && !this.props.isActive && this.itemRef) {
      this.itemRef.scrollIntoViewIfNeeded()
    }
  }

  handleClick = (e) => {
    const {activate, noCloseOnClick, closePortal, onClick} = this.props
    if (noCloseOnClick) {
      activate()
    } else if (closePortal) {
      closePortal()
    }
    if (onClick) {
      onClick(e)
    }
  }

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
    } = this.props
    const labelEl =
      typeof label === 'string' ? (
        <MenuItemLabel hasIcon={Boolean(avatar || icon)} disabled={disabled}>
          {label}
        </MenuItemLabel>
      ) : (
        label
      )
    const titleFallbackStr = typeof label === 'string' ? label : 'Menu Item'
    const titleStr = title || titleFallbackStr
    return (
      <MenuItem
        isActive={isActive}
        role='menuitem'
        title={titleStr}
        innerRef={(c) => {
          this.itemRef = c
        }}
        onClick={this.handleClick}
      >
        {avatar && <MenuItemAvatar alt={titleStr} src={avatar} />}
        {!avatar && icon && !hasDotIcon && <MenuItemIcon icon={icon} iconColor={iconColor} />}
        {!avatar && hasDotIcon && <MenuItemDot iconColor={iconColor} />}
        {children ? React.cloneElement(children, {isActive, menuRef}) : labelEl}
      </MenuItem>
    )
  }
}

export default MenuItemWithShortcuts
