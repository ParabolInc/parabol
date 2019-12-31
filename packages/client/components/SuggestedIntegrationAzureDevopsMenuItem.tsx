import {SuggestedIntegrationAzureDevopsMenuItem_suggestedIntegration} from '../__generated__/SuggestedIntegrationAzureDevopsMenuItem_suggestedIntegration.graphql'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import AzureDevopsSVG from './AzureDevopsSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import SuggestedIntegrationMenuItemAvatar from './SuggestedIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import CreateAzureDevopsWorkItemMutation from '../mutations/CreateAzureDevopsWorkItemMutation'
import {WithMutationProps} from '../utils/relay/withMutationProps'

interface Props {
  suggestedIntegration: SuggestedIntegrationAzureDevopsMenuItem_suggestedIntegration
  taskId: string
  submitMutation: WithMutationProps['submitMutation']
  onError: WithMutationProps['onError']
  onCompleted: WithMutationProps['onCompleted']
  query: string
}

const SuggestedIntegrationAzureDevopsMenuItem = forwardRef((props: Props, ref: any) => {
  const {suggestedIntegration, taskId, submitMutation, onError, onCompleted, query} = props
  const {organization, projectKey, projectName} = suggestedIntegration
  const atmosphere = useAtmosphere()
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <SuggestedIntegrationMenuItemAvatar>
            <AzureDevopsSVG />
          </SuggestedIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={projectName} />
        </MenuItemLabel>
      }
      onClick={() => {
        const variables = {organization, projectKey, taskId}
        submitMutation()
        CreateAzureDevopsWorkItemMutation(atmosphere, variables, {onError, onCompleted})
      }}
    />
  )
})

export default createFragmentContainer(SuggestedIntegrationAzureDevopsMenuItem, {
  suggestedIntegration: graphql`
    fragment SuggestedIntegrationAzureDevopsMenuItem_suggestedIntegration on SuggestedIntegrationAzureDevops {
      organization
      projectName
    }
  `
})
