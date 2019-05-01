import styled from 'react-emotion'
import MenuItemComponentAvatar from 'universal/components/MenuItemComponentAvatar'
import {ICON_SIZE} from 'universal/styles/typographyV2'

const SuggestedIntegrationMenuItemAvatar = styled(MenuItemComponentAvatar)({
  '& svg': {
    display: 'block',
    height: ICON_SIZE.MD18,
    width: ICON_SIZE.MD18
  }
})

export default SuggestedIntegrationMenuItemAvatar
