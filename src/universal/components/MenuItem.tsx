import {keyframes} from 'emotion'
import React, {forwardRef, ReactNode, useEffect, useImperativeHandle, useRef} from 'react'
import styled from 'react-emotion'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import {DECELERATE} from 'universal/styles/animation'
import {PALETTE} from 'universal/styles/paletteV2'
import {Duration} from 'universal/types/constEnums'

declare global {
  interface Element {
    scrollIntoViewIfNeeded: () => void
  }
}

export interface MenuItemProps {
  activate: () => void
  closePortal: () => void
  isActive: boolean
  idx: number
}

interface Props {
  label: ReactNode
  onClick?: (e: React.MouseEvent) => void
  noCloseOnClick?: boolean
}

const fadeUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
	100% {
	  opacity: 1;
	  transform: translateY(0);
	}
`
const itemDuration = Duration.MENU_OPEN / 5
export const menuItemAnimation = (idx) =>
  `${fadeUp} ${itemDuration}ms ${DECELERATE} ${(idx * itemDuration) / 2 +
    Duration.MENU_OPEN}ms forwards`

const MenuItemStyles = styled('div')(({isActive, idx}: {isActive: boolean; idx: number}) => ({
  animation: menuItemAnimation(idx),
  alignItems: 'center',
  backgroundColor: isActive ? PALETTE.BACKGROUND.MAIN : '#fff',
  color: PALETTE.TEXT.MAIN,
  cursor: 'pointer',
  display: 'flex',
  opacity: 0,
  '&:hover,:focus': {
    backgroundColor: isActive ? PALETTE.BACKGROUND.MAIN : PALETTE.BACKGROUND.LIGHTEST,
    outline: 0
  }
}))

const MenuItem = forwardRef((props: Props, ref: any) => {
  const {label, noCloseOnClick, onClick} = props
  const itemRef = useRef<HTMLDivElement>()
  // we're doing something a little hacky here, overloading a callback ref with some props so we don't need to pass them explicitly
  const {activate, closePortal, isActive, idx} = ref as MenuItemProps

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
    <MenuItemStyles
      isActive={isActive}
      role='menuitem'
      innerRef={itemRef}
      onClick={handleClick}
      idx={idx}
    >
      {typeof label === 'string' ? <MenuItemLabel>{label}</MenuItemLabel> : label}
    </MenuItemStyles>
  )
})

export default MenuItem
