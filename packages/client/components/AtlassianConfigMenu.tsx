import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuProps} from '../hooks/useMenu'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import RemoveAtlassianAuthMutation from '../mutations/RemoveAtlassianAuthMutation'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
}

const AtlassianConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const held = AtlassianClientManager.getHeldProducts(atmosphere, teamId)
  const removeSubline =
    held.jira && held.confluence
      ? 'Disconnects Jira and Confluence'
      : held.confluence
        ? 'Disconnects Confluence'
        : 'Disconnects Jira'
  const refreshToken = () => {
    // offline_access-only base: openOAuth's union fills in the held products
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps, ['offline_access'])
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
