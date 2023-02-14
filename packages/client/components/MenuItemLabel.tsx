import styled from '@emotion/styled'
import textOverflow from '../styles/helpers/textOverflow'

export const MenuItemLabelStyle = {
  ...textOverflow,
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: 14,
  lineHeight: '24px',
  padding: `4px 16px 4px 16px`
}

const MenuItemLabel = styled('div')(MenuItemLabelStyle)

export default MenuItemLabel
