import React, {forwardRef, ReactNode, useEffect, useImperativeHandle, useRef} from 'react'
import styled from 'react-emotion'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import ui from 'universal/styles/ui'

declare global {
  interface Element {
    scrollIntoViewIfNeeded: () => void
  }
}

const MenuItemStyle = styled('div')(({isActive}: {isActive: boolean}) => ({
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

export interface MenuItemProps {
  activate: () => void
  closePortal: () => void
  isActive: boolean
}

interface Props {
  label: ReactNode
  onClick?: (e: React.MouseEvent) => void
  noCloseOnClick?: boolean
}

const MenuItem = forwardRef((props: Props, ref: any) => {
  const {label, noCloseOnClick, onClick} = props
  const itemRef = useRef<HTMLDivElement>()
  // we're doing something a little hacky here, overloading a callback ref with some props so we don't need to pass them explicitly
  const {activate, closePortal, isActive} = ref as MenuItemProps

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoViewIfNeeded()
    }
  }, [isActive])

  const handleClick = (e) => {
    if (noCloseOnClick) {
      activate()
    } else if (closePortal) {
      closePortal()
    }
    if (onClick) {
      onClick(e)
    }
  }

  useImperativeHandle(ref, () => ({
    onClick: handleClick
  }))

  return (
    <MenuItemStyle isActive={isActive} role='menuitem' innerRef={itemRef} onClick={handleClick}>
      {typeof label === 'string' ? <MenuItemLabel>{label}</MenuItemLabel> : label}
    </MenuItemStyle>
  )
})

export default MenuItem
