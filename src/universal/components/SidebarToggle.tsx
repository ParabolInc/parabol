import React from 'react'
import IconButton from 'universal/components/IconButton'
import styled from '@emotion/styled'
import {PALETTE} from 'universal/styles/paletteV2'
import {BaseButtonProps} from 'universal/components/BaseButton'

const StyledButton = styled(IconButton)({
  height: 24,
  padding: 0,
  ':hover,:focus,:active': {
    color: PALETTE.TEXT_LIGHT
  }
})

interface Props extends BaseButtonProps {}

const SidebarToggle = (props: Props) => {
  return (
    <StyledButton
      {...props}
      aria-label='Toggle the sidebar'
      icon='menu'
      iconLarge
      palette='midGray'
    />
  )
}
export default SidebarToggle
