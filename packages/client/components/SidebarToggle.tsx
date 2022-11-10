import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'
import {BaseButtonProps} from './BaseButton'
import IconButton from './IconButton'

const StyledButton = styled(IconButton)({
  height: 24,
  padding: 0,
  ':hover,:focus,:active': {
    color: PALETTE.SLATE_600
  }
})

interface Props extends BaseButtonProps {}

const SidebarToggle = (props: Props) => {
  const {dataCy} = props
  return (
    <StyledButton
      {...props}
      dataCy={`${dataCy}-toggle`}
      aria-label='Toggle the sidebar'
      icon='menu'
      iconLarge
      palette='midGray'
    />
  )
}
export default SidebarToggle
