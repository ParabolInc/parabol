import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ICreateAzureDevopsWorkItemOnMutationArguments, TaskServiceEnum} from '../types/graphql'
import makeSuggestedIntegrationId from '../utils/makeSuggestedIntegrationId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import Atmosphere from '../Atmosphere'
import {LocalHandlers} from '../types/relayMutations'
import {CreateAzureDevopsWorkItemMutation as TCreateAzureDevopsWorkItemMutation} from '../__generated__/CreateAzureDevopsWorkItemMutation.graphql'

graphql`
  fragment CreateAzureDevopsWorkItemMutation_task on CreateAzureDevopsWorkItemPayload {
    task {
      integration {
        service
        ... on TaskIntegrationAzureDevops {
          organization
          projectKey
          projectName
        }
        ...TaskIntegrationLinkIntegrationAzureDevops
      }
      updatedAt
      teamId
      userId
    }
  }
`

const mutation = graphql`
  mutation CreateAzureDevopsWorkItemMutation($organization: ID!, $taskId: ID!, $projectKey: ID!) {
    createAzureDevopsWorkItem(
      organization: $organization
      taskId: $taskId
      projectKey: $projectKey
    ) {
      error {
        message
      }
      ...CreateAzureDevopsWorkItemMutation_task @relay(mask: false)
    }
  }
`

const CreateAzureDevopsWorkItemMutation = (
  atmosphere: Atmosphere,
  variables: ICreateAzureDevopsWorkItemOnMutationArguments,
  {onCompleted, onError}: LocalHandlers
) => {
  return commitMutation<TCreateAzureDevopsWorkItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      // TODO break out into subscription & also reorder suggested items (put newest on top if exists)
      const payload = store.getRootField('createAzureDevopsWorkItem')
      if (!payload) return
      const task = payload.getLinkedRecord('task')
      if (!task) return
      const userId = task.getValue('userId')
      const teamId = task.getValue('teamId')
      const integration = task.getLinkedRecord('integration')
      const user = store.get(userId)
      if (!user || !integration) return
      const suggestedIntegrations = user.getLinkedRecord('suggestedIntegrations', {teamId})
      const projectKey = integration.getValue('projectKey')
      if (!suggestedIntegrations || !projectKey) return
      const items = suggestedIntegrations.getLinkedRecords('items')
      if (!items) return
      const existingIntegration = items.find(
        (item) => !!(item && item.getValue('projectKey') === projectKey)
      )
      const hasMore = suggestedIntegrations.getValue('hasMore')
      if (!existingIntegration || !hasMore) {
        const projectName = integration.getValue('projectName')
        const organization = integration.getValue('organization')
        if (!projectName || !organization) return
        const nextItem = {
          organization,
          projectKey,
          projectName,
          service: TaskServiceEnum.azuredevops
        }
        const id = makeSuggestedIntegrationId(nextItem)
        // the fallback is likely never used
        const latestIntegration =
          store.get(id) ||
          createProxyRecord(store, 'SuggestedIntegrationAzureDevops', {
            id,
            ...nextItem
          })
        const nextSuggestedIntegrations = [latestIntegration, ...items].slice(0, hasMore ? 3 : 1)
        suggestedIntegrations.setLinkedRecords(nextSuggestedIntegrations, 'items')
        suggestedIntegrations.setValue(true, 'hasMore')
      }
    },
    optimisticUpdater: (store) => {
      const {organization, projectKey, taskId} = variables
      const now = new Date()
      const task = store.get(taskId)
      if (!task) return
      const optimisticIntegration = {
        service: TaskServiceEnum.azuredevops,
        projectKey,
        organization,
        issueKey: '?',
        cloudName: '',
        updatedAt: now.toJSON()
      }
      const integration = createProxyRecord(
        store,
        'TaskIntegrationAzureDevops',
        optimisticIntegration
      )
      task.setLinkedRecord(integration, 'integration')
    },
    onCompleted,
    onError
  })
}

export default CreateAzureDevopsWorkItemMutation
