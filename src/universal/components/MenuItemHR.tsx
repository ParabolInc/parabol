import React, {forwardRef} from 'react'
import styled from 'react-emotion'
import {menuItemAnimation} from 'universal/components/MenuItem'
import {PALETTE} from 'universal/styles/paletteV2'

const StyledHR = styled('hr')(({idx}: {idx: number}) => ({
  animation: menuItemAnimation(idx),
  backgroundColor: PALETTE.BORDER.LIGHT,
  border: 'none',
  height: '.0625rem',
  marginBottom: 8,
  marginTop: 8,
  opacity: 0,
  padding: 0
}))

const MenuItemHR = forwardRef((_props: object, ref: any) => {
  return <StyledHR idx={ref.idx} />
})

export default MenuItemHR
