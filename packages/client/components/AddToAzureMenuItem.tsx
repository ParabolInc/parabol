import graphql from 'babel-plugin-relay/macro'
import {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import type {AddToAzureMenuItem_AzureIntegration$key} from '../__generated__/AddToAzureMenuItem_AzureIntegration.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import AzureDevOpsClientManager from '../utils/AzureDevOpsClientManager'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  azureRef: AddToAzureMenuItem_AzureIntegration$key
}

const AddToAzureMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId, azureRef} = props
  const atmosphere = useAtmosphere()
  const azure = useFragment(
    graphql`
      fragment AddToAzureMenuItem_AzureIntegration on AzureDevOpsIntegration {
        cloudProvider {
          id
          clientId
          tenantId
        }
      }
    `,
    azureRef
  )
  const {cloudProvider} = azure
  if (!cloudProvider) return null

  const onClick = () => {
    if (!cloudProvider.tenantId) return
    AzureDevOpsClientManager.openOAuth(atmosphere, teamId, cloudProvider, mutationProps)
  }

  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemComponentAvatar className='[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]'>
            <AzureDevOpsSVG />
          </MenuItemComponentAvatar>
          {'Add Azure integration'}
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default AddToAzureMenuItem
