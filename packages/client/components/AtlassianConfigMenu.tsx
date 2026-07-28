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
  const refreshToken = () => {
    // intent: keep what we have — openOAuth unions in the held products
    // (falls back to the Jira set if the grant is unreadable)
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
            <div className='text-fg-muted text-xs'>{'Disconnects Jira and Confluence'}</div>
          </div>
        }
        onClick={removeAtlassian}
      />
    </Menu>
  )
}

export default AtlassianConfigMenu
