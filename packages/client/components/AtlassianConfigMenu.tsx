import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import {hasConfluenceScopes, hasJiraScopes} from '../utils/atlassianScopes'

interface Props {
  mutationProps: MenuMutationProps
  teamId: string
  provider: ConnectProvider
  heldScopes?: readonly string[] | null
}

const AtlassianConfigMenu = (props: Props) => {
  const {mutationProps, teamId, provider, heldScopes} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const holdsJira = hasJiraScopes(heldScopes)
  const holdsConfluence = hasConfluenceScopes(heldScopes)
  const removeSubline =
    holdsJira && holdsConfluence
      ? 'Disconnects Jira and Confluence'
      : holdsConfluence
        ? 'Disconnects Confluence'
        : 'Disconnects Jira'
  const refreshToken = () => {
    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      provider,
      mutationProps,
      ['offline_access'],
      heldScopes
    )
  }

  const removeAtlassian = () => {
    if (submitting) return
    submitMutation()
    RemoveTeamMemberIntegrationAuthMutation(
      atmosphere,
      {service: 'jira', teamId},
      {onError, onCompleted}
    )
  }
  return (
    <MenuContent>
      <MenuItem onClick={refreshToken}>Refresh token</MenuItem>
      <MenuItem onClick={removeAtlassian}>
        <div className='py-1'>
          <div>{'Remove Atlassian connection'}</div>
          <div className='text-fg-muted text-xs'>{removeSubline}</div>
        </div>
      </MenuItem>
    </MenuContent>
  )
}

export default AtlassianConfigMenu
