import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuProps} from '../hooks/useMenu'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveAtlassianAuthMutation from '../mutations/RemoveAtlassianAuthMutation'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import {hasConfluenceScopes, hasJiraScopes} from '../utils/atlassianScopes'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
  heldScopes?: readonly string[] | null
}

const AtlassianConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId, heldScopes} = props
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
      mutationProps,
      ['offline_access'],
      heldScopes
    )
  }

  const removeAtlassian = () => {
    if (submitting) return
    submitMutation()
    RemoveAtlassianAuthMutation(atmosphere, {teamId}, {onError, onCompleted})
  }
  return (
    <Menu ariaLabel={'Configure your Atlassian integration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={refreshToken} />
      <MenuItem
        label={
          <div className='px-4 py-1'>
            <div>{'Remove Atlassian connection'}</div>
            <div className='text-fg-muted text-xs'>{removeSubline}</div>
          </div>
        }
        onClick={removeAtlassian}
      />
    </Menu>
  )
}

export default AtlassianConfigMenu
