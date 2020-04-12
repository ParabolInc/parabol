import styled from '@emotion/styled'

const MenuItemDot = styled('div')<{color: string}>(({color}) => ({
  backgroundColor: color,
  borderRadius: 6,
  display: 'inline-block',
  height: 6,
  marginRight: 12,
  width: 6
}))

export default MenuItemDot
