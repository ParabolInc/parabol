import {keyframes} from 'emotion'
import React, {ReactNode} from 'react'
import styled from 'react-emotion'
import {Omit} from 'types/generics'
import {PortalState} from 'universal/hooks/usePortal'
import {DECELERATE} from 'universal/styles/animation'
import {Duration} from 'universal/types/constEnums'

declare global {
  interface Element {
    scrollIntoViewIfNeeded: () => void
  }
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

export const menuItemAnimation = (idx: number, itemsToAnimate: number, isDropdown?: boolean) => {
  const itemDuration = Duration.MENU_OPEN / 3
  if (isDropdown) {
    const fixedDelay = Duration.MENU_OPEN / 4
    const timeRemaining = Duration.MENU_OPEN - fixedDelay
    const variableDelay = timeRemaining * (idx / itemsToAnimate)
    const totalDelay = fixedDelay + variableDelay
    // last item finishes animating in at Duration.MENU_OPEN + itemDuration
    return `${fadeUp} ${itemDuration}ms ${DECELERATE} ${totalDelay}ms forwards`
  } else {
    // based on the decelerate curve with an 8px left margin, we can begin animating after about 75% complete
    // const Duration.MENU_OPEN_MAX
    const decelerate8pxLeftMarginCoeff = 3 / 4
    const fixedDelay = Duration.MENU_OPEN * decelerate8pxLeftMarginCoeff
    // this animation will always exceed the Duration.MENU_OPEN by timeRemaining
    const timeRemaining = Duration.MENU_OPEN_MAX - fixedDelay
    const variableDelay = idx * (timeRemaining / itemsToAnimate)
    const totalDelay = fixedDelay + variableDelay
    return `${fadeUp} ${itemDuration}ms ${DECELERATE} ${totalDelay}ms forwards`
  }
}

interface Props {
  children: ReactNode
  idx: number
  itemsToAnimate: number
  isDropdown: boolean
  portalState: PortalState
}

const MenuItemStyles = styled('div')(
  ({idx, itemsToAnimate, isDropdown, portalState}: Omit<Props, 'children'>) => ({
    animation:
      portalState < PortalState.AnimatedIn
        ? menuItemAnimation(idx, itemsToAnimate, isDropdown)
        : undefined,
    opacity: portalState < PortalState.AnimatedIn ? 0 : 1
  })
)

const MenuItemAnimation = (props: Props) => {
  const {children, idx, itemsToAnimate, isDropdown, portalState} = props
  return (
    <MenuItemStyles
      idx={idx}
      itemsToAnimate={itemsToAnimate}
      isDropdown={isDropdown}
      portalState={portalState}
    >
      {children}
    </MenuItemStyles>
  )
}

export default MenuItemAnimation
