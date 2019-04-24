import React, {forwardRef} from 'react'
import styled from 'react-emotion'
import {menuItemAnimation} from 'universal/components/MenuItem'
import ui from 'universal/styles/ui'

const StyledHR = styled('hr')(({idx}: {idx: number}) => ({
  animation: menuItemAnimation(idx),
  backgroundColor: ui.menuBorderColor,
  border: 'none',
  height: '.0625rem',
  marginBottom: ui.menuGutterVertical,
  marginTop: ui.menuGutterVertical,
  opacity: 0,
  padding: 0
}))

const MenuItemHR = forwardRef((_props: object, ref: any) => {
  return <StyledHR idx={ref.idx} />
})

export default MenuItemHR
