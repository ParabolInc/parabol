import React from 'react'
import IconButton from 'universal/components/IconButton'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const StyledButton = styled(IconButton)({
  height: 24,
  margin: 'auto 16px auto 0',
  padding: 0,
  width: 24,
  ':hover,:focus,:active': {
    color: ui.palette.mid
  }
})

const SidebarToggle = (props) => (
  <StyledButton
    {...props}
    aria-label='Toggle the sidebar'
    icon='menu'
    iconLarge
    palette='midGray'
  />
)

export default SidebarToggle
