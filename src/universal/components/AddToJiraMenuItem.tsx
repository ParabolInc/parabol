import React, {forwardRef} from 'react'
import JiraSVG from 'universal/components/JiraSVG'
import MenuItem from 'universal/components/MenuItem'
import MenuItemComponentAvatar from 'universal/components/MenuItemComponentAvatar'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuMutationProps} from 'universal/hooks/useMutationProps'
import styled from 'react-emotion'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import AtlassianClientManager from 'universal/utils/AtlassianClientManager'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
}

const MenuItemIcon = styled(MenuItemComponentAvatar)({
  '& svg': {
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
