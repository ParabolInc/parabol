import styled from '@emotion/styled'
import textOverflow from 'universal/styles/helpers/textOverflow'

const MenuItemLabel = styled('div')({
  ...textOverflow,
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: 14,
  lineHeight: '24px',
  padding: `4px 8px 4px 16px`
})

export default MenuItemLabel
