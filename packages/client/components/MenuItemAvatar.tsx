import styled from '@emotion/styled'
import {ICON_SIZE} from '../styles/typographyV2'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'

const MenuItemAvatar = styled(MenuItemComponentAvatar)({
  svg: {
    display: 'block',
    height: ICON_SIZE.MD18,
    width: ICON_SIZE.MD18
  }
})

export default MenuItemAvatar
