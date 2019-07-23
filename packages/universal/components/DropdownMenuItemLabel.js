import styled from '@emotion/styled'
import textOverflow from 'universal/styles/helpers/textOverflow'
import ui from 'universal/styles/ui'

const DropdownMenuItemLabel = styled('span')({
  ...textOverflow,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  padding: `0 16px`
})

export default DropdownMenuItemLabel
