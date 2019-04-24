import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import ui from 'universal/styles/ui'

const MenuItemHR = styled('hr')({
  backgroundColor: PALETTE.BORDER.LIGHTER,
  border: 'none',
  height: '.0625rem',
  marginBottom: ui.menuGutterVertical,
  marginTop: ui.menuGutterVertical,
  padding: 0
})

export default MenuItemHR
