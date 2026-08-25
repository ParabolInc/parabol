import {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import GitHubClientManager from '../utils/GitHubClientManager'
import GitHubSVG from './GitHubSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  provider: ConnectProvider | null
}

const AddToGitHubMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId, provider} = props
  const atmosphere = useAtmosphere()
  const openOAuth = () => {
    if (!provider) return
    GitHubClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }
  if (!provider) return null
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemComponentAvatar className='[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]'>
            <GitHubSVG />
          </MenuItemComponentAvatar>
          {'Add GitHub integration'}
        </MenuItemLabel>
      }
      onClick={openOAuth}
    />
  )
})

export default AddToGitHubMenuItem
