import styled from '@emotion/styled'
import textOverflow from '../styles/helpers/textOverflow'
import ui from '../styles/ui'

const DropdownMenuItemLabel = styled('span')({
  ...textOverflow,
  fontSize: 15,
  lineHeight: '32px',
  padding: `0 16px`
})

export default DropdownMenuItemLabel
