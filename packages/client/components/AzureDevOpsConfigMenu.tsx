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
    <Menu ariaLabel={t('AzureDevOpsConfigMenu.ConfigureYourAzureDevOpsIntegration')} {...menuProps}>
      <MenuItem label={t('AzureDevOpsConfigMenu.RefreshToken')} onClick={openOAuth} />
      <MenuItem label={t('AzureDevOpsConfigMenu.RemoveAzureDevOps')} onClick={removeAzureDevOps} />
    </Menu>
  )
}

export default AzureDevOpsConfigMenu
