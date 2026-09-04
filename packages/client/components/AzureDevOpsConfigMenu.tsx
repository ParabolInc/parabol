import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../types/constEnums'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import AzureDevOpsClientManager from '../utils/AzureDevOpsClientManager'

interface Props {
  mutationProps: MenuMutationProps
  teamId: string
  provider: any
}

const AzureDevOpsConfigMenu = (props: Props) => {
  const {mutationProps, teamId, provider} = props
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
    <MenuContent>
      <MenuItem onClick={openOAuth}>Refresh token</MenuItem>
      <MenuItem onClick={removeAzureDevOps}>Remove Azure DevOps</MenuItem>
    </MenuContent>
  )
}

export default AzureDevOpsConfigMenu
