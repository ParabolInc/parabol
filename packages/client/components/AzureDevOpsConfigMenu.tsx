import React from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../types/constEnums'
import AzureDevOpsClientManager from '../utils/AzureDevOpsClientManager'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
  providerId: string
}

const AzureDevOpsConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId, providerId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    AzureDevOpsClientManager.openOAuth(atmosphere, teamId, providerId, mutationProps)
  }

  const removeAzureDevOps = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(atmosphere, {teamId, service: 'azureDevOps'}, {onCompleted, onError})
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={'Configure your Azure DevOps integration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Azure DevOps' onClick={removeAzureDevOps} />
    </Menu>
  )
}

export default AzureDevOpsConfigMenu
