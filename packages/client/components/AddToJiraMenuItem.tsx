import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import {ICON_SIZE} from '../styles/typographyV2'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
}

const MenuItemIcon = styled(MenuItemComponentAvatar)({
  svg: {
    display: 'block',
    height: ICON_SIZE.MD18,
    width: ICON_SIZE.MD18
  }
})

const AddToJiraMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId} = props
  const atmosphere = useAtmosphere()
  const onClick = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemIcon>
            <JiraSVG />
          </MenuItemIcon>
          {'Add Jira integration'}
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default AddToJiraMenuItem
