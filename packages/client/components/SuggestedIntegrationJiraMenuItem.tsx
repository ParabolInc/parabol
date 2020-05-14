import {SuggestedIntegrationJiraMenuItem_suggestedIntegration} from '../__generated__/SuggestedIntegrationJiraMenuItem_suggestedIntegration.graphql'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import SuggestedIntegrationMenuItemAvatar from './SuggestedIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import CreateJiraIssueMutation from '../mutations/CreateJiraIssueMutation'
import {WithMutationProps} from '../utils/relay/withMutationProps'

interface Props {
  suggestedIntegration: SuggestedIntegrationJiraMenuItem_suggestedIntegration
  taskId: string
  submitMutation: WithMutationProps['submitMutation']
  onError: WithMutationProps['onError']
  onCompleted: WithMutationProps['onCompleted']
  query: string
}

const SuggestedIntegrationJiraMenuItem = forwardRef((props: Props, ref: any) => {
  const {suggestedIntegration, taskId, submitMutation, onError, onCompleted, query} = props
  const {cloudId, projectKey, projectName} = suggestedIntegration
  const atmosphere = useAtmosphere()
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel data-cy={`jira-integration`}>
          <SuggestedIntegrationMenuItemAvatar>
            <JiraSVG />
          </SuggestedIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={projectName} />
        </MenuItemLabel>
      }
      onClick={() => {
        const variables = {cloudId, projectKey, taskId}
        submitMutation()
        CreateJiraIssueMutation(atmosphere, variables, {onError, onCompleted})
      }}
    />
  )
})

export default createFragmentContainer(SuggestedIntegrationJiraMenuItem, {
  suggestedIntegration: graphql`
    fragment SuggestedIntegrationJiraMenuItem_suggestedIntegration on SuggestedIntegrationJira {
      cloudId
      projectKey
      projectName
    }
  `
})
