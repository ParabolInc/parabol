import React, {forwardRef, ReactNode, useEffect, useImperativeHandle, useRef} from 'react'
import styled from 'react-emotion'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import {PALETTE} from 'universal/styles/paletteV2'

export interface MenuItemProps {
  isActive: boolean
  activate: () => void
  closePortal: () => void
}

interface Props {
  isDisabled?: boolean
  label: ReactNode
  onClick?: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
  noCloseOnClick?: boolean
}

const MenuItemStyles = styled('div')(
  ({isActive, isDisabled}: {isActive: boolean; isDisabled: boolean | undefined}) => ({
    alignItems: 'center',
    backgroundColor: isActive ? PALETTE.BACKGROUND_MAIN : undefined,
    color: isDisabled ? PALETTE.TEXT_LIGHT : PALETTE.TEXT_MAIN,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    '&:hover,:focus': {
      backgroundColor: isActive ? PALETTE.BACKGROUND_MAIN : PALETTE.BACKGROUND_LIGHTEST,
      outline: 0
    }
  })
)

const MenuItem = forwardRef((props: Props, ref: any) => {
  const {isDisabled, label, noCloseOnClick, onMouseEnter, onClick} = props
  const itemRef = useRef<HTMLDivElement>(null)
  // we're doing something a little hacky here, overloading a callback ref with some props so we don't need to pass them explicitly
  const {activate, closePortal, isActive} = ref as MenuItemProps

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoViewIfNeeded()
    }
  }, [isActive])

  const handleClick = (e) => {
    if (isDisabled) return
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
    <MenuItemStyles
      isDisabled={isDisabled}
      role='menuitem'
      innerRef={itemRef}
      isActive={isActive}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
    >
      {typeof label === 'string' ? <MenuItemLabel>{label}</MenuItemLabel> : label}
    </MenuItemStyles>
  )
})

export default MenuItem
