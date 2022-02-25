import styled from '@emotion/styled'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import {ICON_SIZE} from '../styles/typographyV2'

const RepoIntegrationMenuItemAvatar = styled(MenuItemComponentAvatar)({
  '& svg': {
    display: 'block',
    height: ICON_SIZE.MD18,
    width: ICON_SIZE.MD18
  }
})

export default RepoIntegrationMenuItemAvatar
