import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const MenuItemDot = styled('div')(({iconColor}: {iconColor: string}) => ({
  backgroundColor: iconColor || 'inherit',
  borderRadius: '.375rem',
  height: '.375rem',
  marginLeft: ui.menuGutterHorizontal,
  marginRight: ui.menuGutterInner,
  width: '.375rem'
}))

export default MenuItemDot
