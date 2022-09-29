import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {PortalStatus} from '../hooks/usePortal'
import {DECELERATE, fadeUp} from '../styles/animation'
import {Duration} from '../types/constEnums'
import {Omit} from '../types/generics'

declare global {
  interface Element {
    scrollIntoViewIfNeeded: () => void
  }
}

export const menuItemAnimation = (idx: number, itemsToAnimate: number, isDropdown?: boolean) => {
  const itemDuration = Duration.MENU_OPEN / 3
  if (isDropdown) {
    const fixedDelay = Duration.MENU_OPEN / 4
    const timeRemaining = Duration.MENU_OPEN - fixedDelay
    const variableDelay = timeRemaining * (idx / itemsToAnimate)
    const totalDelay = fixedDelay + variableDelay
    // last item finishes animating in at Duration.MENU_OPEN + itemDuration
    return `${fadeUp.toString()} ${itemDuration}ms ${DECELERATE} ${totalDelay}ms forwards`
  } else {
    // based on the decelerate curve with an 8px left margin, we can begin animating after about 75% complete
    // const Duration.MENU_OPEN_MAX
    const decelerate8pxLeftMarginCoeff = 3 / 4
    const fixedDelay = Duration.MENU_OPEN * decelerate8pxLeftMarginCoeff
    // this animation will always exceed the Duration.MENU_OPEN by timeRemaining
    const timeRemaining = Duration.MENU_OPEN_MAX - fixedDelay
    const variableDelay = idx * (timeRemaining / itemsToAnimate)
    const totalDelay = fixedDelay + variableDelay
    return `${fadeUp.toString()} ${itemDuration}ms ${DECELERATE} ${totalDelay}ms forwards`
  }
}

interface Props {
  children: ReactNode
  idx: number
  itemsToAnimate: number
  isDropdown: boolean
  portalStatus: PortalStatus
}

const MenuItemStyles = styled('div')<Omit<Props, 'children'>>(
  ({idx, itemsToAnimate, isDropdown, portalStatus}) => ({
    animation:
      portalStatus < PortalStatus.Entered
        ? menuItemAnimation(idx, itemsToAnimate, isDropdown)
        : undefined,
    opacity: portalStatus < PortalStatus.Entered ? 0 : 1
  })
)

const MenuItemAnimation = (props: Props) => {
  const {children, idx, itemsToAnimate, isDropdown, portalStatus} = props
  return (
    <MenuItemStyles
      idx={idx}
      itemsToAnimate={itemsToAnimate}
      isDropdown={isDropdown}
      portalStatus={portalStatus}
    >
      {children}
    </MenuItemStyles>
  )
}

export default MenuItemAnimation
