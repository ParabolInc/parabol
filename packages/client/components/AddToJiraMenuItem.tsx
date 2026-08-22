import {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  provider: ConnectProvider | null
  heldScopes?: readonly string[] | null
}

const AddToJiraMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId, provider, heldScopes} = props
  const atmosphere = useAtmosphere()
  const onClick = () => {
    if (!provider) return
    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      provider,
      mutationProps,
      AtlassianClientManager.JIRA_SCOPE,
      heldScopes
    )
  }
  if (!AtlassianClientManager.isAvailable || !provider) return null
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemComponentAvatar className='[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]'>
            <JiraSVG />
          </MenuItemComponentAvatar>
          {'Add Jira integration'}
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default AddToJiraMenuItem
