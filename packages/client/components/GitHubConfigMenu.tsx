import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Duration} from '../types/constEnums'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import GitHubClientManager from '../utils/GitHubClientManager'

interface Props {
  mutationProps: MenuMutationProps
  teamId: string
  provider: ConnectProvider
}

const GitHubConfigMenu = (props: Props) => {
  const {mutationProps, teamId, provider} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    GitHubClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }

  const removeGitHub = () => {
    if (submitting) return
    submitMutation()
    // wait for the portal to animate closed before removing, otherwise it'll stick around forever
    setTimeout(() => {
      RemoveTeamMemberIntegrationAuthMutation(
        atmosphere,
        {service: 'github', teamId},
        {onCompleted, onError}
      )
    }, Duration.PORTAL_CLOSE)
  }
  return (
    <MenuContent>
      <MenuItem onClick={openOAuth}>Refresh token</MenuItem>
      <MenuItem onClick={removeGitHub}>Remove GitHub</MenuItem>
    </MenuContent>
  )
}

export default GitHubConfigMenu
