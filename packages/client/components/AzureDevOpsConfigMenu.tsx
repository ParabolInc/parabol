import React from 'react'
import {useTranslation} from 'react-i18next'
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
  provider: any
}

const AzureDevOpsConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId, provider} = props

  //FIXME i18n: Refresh token
  //FIXME i18n: Remove Azure DevOps
  const {t} = useTranslation()

  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    AzureDevOpsClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }

  const removeAzureDevOps = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(
        atmosphere,
        {teamId, service: 'azureDevOps'},
        {onCompleted, onError}
      )
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <Menu ariaLabel={t('AzureDevOpsConfigMenu.ConfigureYourAzureDevopsIntegration')} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      <MenuItem label='Remove Azure DevOps' onClick={removeAzureDevOps} />
    </Menu>
  )
}

export default AzureDevOpsConfigMenu
