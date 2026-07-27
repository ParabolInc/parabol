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
  showEnableConfluence?: boolean
}

const AtlassianConfigMenu = (props: Props) => {
  const {menuProps, mutationProps, teamId, showEnableConfluence} = props
  const {onError, onCompleted, submitMutation, submitting} = mutationProps
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const enableConfluence = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps, [
      ...AtlassianClientManager.SCOPE,
      ...AtlassianClientManager.CONFLUENCE_SCOPE
    ])
  }

  const removeAtlassian = () => {
    if (submitting) return
    submitMutation()
    RemoveAtlassianAuthMutation(atmosphere, {teamId}, {onError, onCompleted})
  }
  return (
    <Menu ariaLabel={'Configure your Atlassian integration'} {...menuProps}>
      <MenuItem label='Refresh token' onClick={openOAuth} />
      {showEnableConfluence && <MenuItem label='Enable Confluence' onClick={enableConfluence} />}
      <MenuItem label='Remove Atlassian' onClick={removeAtlassian} />
    </Menu>
  )
}

export default AtlassianConfigMenu
