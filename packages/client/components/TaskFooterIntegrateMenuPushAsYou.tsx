import React from 'react'
import styled from '@emotion/styled'
import Menu from './Menu'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'

interface Props {
  menuProps: MenuProps
}

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontStyle: 'italic',
  padding: 8
})

const TaskFooterIntegrateMenuPushAsYou = (props: Props) => {
  const {menuProps} = props
  return (
    <Menu ariaLabel={'Push with your credentials'} {...menuProps}>
      <Label>Push with your credentials</Label>
    </Menu>
  )
}

export default TaskFooterIntegrateMenuPushAsYou
