import React from 'react'
import IconButton from 'universal/components/IconButton'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const StyledButton = styled(IconButton)({
  ':hover,:focus,:active': {
    color: ui.palette.mid
  }
})

const SidebarToggle = (props) => (
  <StyledButton
    {...props}
    aria-label="Toggle the sidebar"
    icon="menu"
    iconLarge
    palette="midGray"
  />
)

export default SidebarToggle
