import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import {ICON_SIZE} from '../styles/typographyV2'
import AzureDevOpsClientManager from '../utils/AzureDevOpsClientManager'
import {AddToAzureMenuItem_AzureIntegration$key} from '../__generated__/AddToAzureMenuItem_AzureIntegration.graphql'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  azureRef: AddToAzureMenuItem_AzureIntegration$key
}

const MenuItemIcon = styled(MenuItemComponentAvatar)({
  '& svg': {
    display: 'block',
    height: ICON_SIZE.MD18,
    width: ICON_SIZE.MD18
  }
})

const AddToAzureMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId, azureRef} = props
  const atmosphere = useAtmosphere()
  const azure = useFragment(
    graphql`
      fragment AddToAzureMenuItem_AzureIntegration on AzureDevOpsIntegration {
        cloudProvider {
          id
          clientId
          tenantId
        }
      }
    `,
    azureRef
  )
  const {cloudProvider} = azure
  if (!cloudProvider) return null

  const onClick = () => {
    if (!cloudProvider.tenantId) return
    AzureDevOpsClientManager.openOAuth(atmosphere, teamId, cloudProvider, mutationProps)
  }

  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemIcon>
            <AzureDevOpsSVG />
          </MenuItemIcon>
          {'Add Azure integration'}
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default AddToAzureMenuItem
