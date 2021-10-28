import React from 'react'
import styled from '@emotion/styled'
import Menu from './Menu'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'

interface Props {
  menuProps: MenuProps
  preferredName: string
}

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontStyle: 'italic',
  padding: 8
})

const TaskFooterIntegrateMenuPushOnBehalf = (props: Props) => {
  const {preferredName, menuProps} = props
  return (
    <Menu ariaLabel={'Push on behalf of the assignee'} {...menuProps}>
      <Label>Push as {preferredName}</Label>
    </Menu>
  )
}

export default TaskFooterIntegrateMenuPushOnBehalf
