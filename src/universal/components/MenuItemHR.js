import ui from 'universal/styles/ui'
import styled from 'react-emotion'

const MenuItemHR = styled('hr')({
  backgroundColor: ui.menuBorderColor,
  border: 'none',
  height: '.0625rem',
  marginBottom: ui.menuGutterVertical,
  marginTop: ui.menuGutterVertical,
  padding: 0
})

export default MenuItemHR
