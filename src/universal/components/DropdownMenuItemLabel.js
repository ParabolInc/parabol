import styled from 'react-emotion'
import textOverflow from 'universal/styles/helpers/textOverflow'
import ui from 'universal/styles/ui'

const DropdownMenuItemLabel = styled('span')({
  ...textOverflow,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  padding: `0 ${ui.menuGutterHorizontal}`
})

export default DropdownMenuItemLabel
