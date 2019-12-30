import React, {forwardRef} from 'react'
import AzureDevopsSVG from './AzureDevopsSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import styled from '@emotion/styled'
import {ICON_SIZE} from '../styles/typographyV2'
import AzureDevopsClientManager from '../utils/AzureDevopsClientManager'

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

const AddToAzureDevopsMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId} = props
  const atmosphere = useAtmosphere()
  const onClick = () => {
    AzureDevopsClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemIcon>
            <AzureDevopsSVG />
          </MenuItemIcon>
          {'Add Azure Devops integration'}
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default AddToAzureDevopsMenuItem
