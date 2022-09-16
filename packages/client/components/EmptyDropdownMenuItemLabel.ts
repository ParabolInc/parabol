import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV3'
import MenuItemLabel from './MenuItemLabel'

export const EmptyDropdownMenuItemLabel = styled(MenuItemLabel)({
  color: PALETTE.SLATE_600,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})
