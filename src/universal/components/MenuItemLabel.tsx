import styled from 'react-emotion'
import textOverflow from 'universal/styles/helpers/textOverflow'
import ui from 'universal/styles/ui'

const MenuItemLabel = styled('div')(
  ({hasIcon, disabled}: {hasIcon?: boolean; disabled?: boolean}) => ({
    ...textOverflow,
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal}`,
    paddingLeft: hasIcon && 0,
    color: disabled && 'grey'
  })
)

export default MenuItemLabel
