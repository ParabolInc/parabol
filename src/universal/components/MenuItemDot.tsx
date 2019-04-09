import styled from 'react-emotion'

const MenuItemDot = styled('div')(({color}: {color: string}) => ({
  backgroundColor: color,
  borderRadius: 6,
  display: 'inline-block',
  height: 6,
  marginRight: 12,
  width: 6
}))

export default MenuItemDot
