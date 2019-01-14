import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const MenuItemAvatar = styled('img')({
  borderRadius: '100%',
  height: '1.5rem',
  marginLeft: ui.menuGutterHorizontal,
  marginRight: ui.menuGutterInner,
  minWidth: '1.5rem',
  width: '1.5rem'
})

export default MenuItemAvatar
