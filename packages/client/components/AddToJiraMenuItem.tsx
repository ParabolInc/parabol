import {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import {MenuItem} from '../ui/Menu/MenuItem'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import JiraSVG from './JiraSVG'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  provider: ConnectProvider | null
  heldScopes?: readonly string[] | null
}

const AddToJiraMenuItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
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
  if (!provider) return null
  return (
    <MenuItem ref={ref} onClick={onClick}>
      <MenuItemComponentAvatar className='[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]'>
        <JiraSVG />
      </MenuItemComponentAvatar>
      {'Add Jira integration'}
    </MenuItem>
  )
})

export default AddToJiraMenuItem
