import {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import {MenuItem} from '../ui/Menu/MenuItem'
import GitHubClientManager from '../utils/GitHubClientManager'
import GitHubSVG from './GitHubSVG'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  provider: ConnectProvider | null
}

const AddToGitHubMenuItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {mutationProps, teamId, provider} = props
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    if (!provider) return
    GitHubClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }
  if (!provider) return null
  return (
    <MenuItem ref={ref} onClick={openOAuth}>
      <MenuItemComponentAvatar className='[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]'>
        <GitHubSVG />
      </MenuItemComponentAvatar>
      {'Add GitHub integration'}
    </MenuItem>
  )
})

export default AddToGitHubMenuItem
