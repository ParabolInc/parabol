import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {
  ICreateJiraTaskIntegrationOnMutationArguments,
  ISuggestedIntegrationJira,
  ISuggestedIntegrationQueryPayload,
  TaskServiceEnum
} from '../types/graphql'
import makeSuggestedIntegrationId from '../utils/makeSuggestedIntegrationId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import Atmosphere from '../Atmosphere'
import {LocalHandlers} from '../types/relayMutations'
import {CreateJiraTaskIntegrationMutation as TCreateJiraTaskIntegrationMutation} from '../__generated__/CreateJiraTaskIntegrationMutation.graphql'

graphql`
  fragment CreateJiraTaskIntegrationMutation_task on CreateJiraTaskIntegrationPayload {
    task {
      integration {
        service
        ... on TaskIntegrationJira {
          cloudId
          projectKey
          projectName
        }
        ...TaskIntegrationLinkIntegrationJira
      }
      updatedAt
      teamId
      userId
    }
  }
`

const mutation = graphql`
  mutation CreateJiraTaskIntegrationMutation($cloudId: ID!, $taskId: ID!, $projectKey: ID!) {
    createJiraTaskIntegration(cloudId: $cloudId, taskId: $taskId, projectKey: $projectKey) {
      error {
        message
      }
      ...CreateJiraTaskIntegrationMutation_task @relay(mask: false)
    }
  }
`

const CreateJiraTaskIntegrationMutation = (
  atmosphere: Atmosphere,
  variables: ICreateJiraTaskIntegrationOnMutationArguments,
  {onCompleted, onError}: LocalHandlers
) => {
  return commitMutation<TCreateJiraTaskIntegrationMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      // TODO break out into subscription & also reorder suggested items (put newest on top if exists)
      const payload = store.getRootField('createJiraTaskIntegration')
      if (!payload) return
      const task = payload.getLinkedRecord('task')
      if (!task) return
      const userId = task.getValue('userId')
      const teamId = task.getValue('teamId')
      const integration = task.getLinkedRecord('integration')
      if (!userId) return
      const user = store.get(userId)
      if (!user || !integration) return
      const suggestedIntegrations = user.getLinkedRecord<ISuggestedIntegrationQueryPayload>(
        'suggestedIntegrations',
        {teamId}
      )
      const projectKey = integration.getValue('projectKey')
      if (!suggestedIntegrations || !projectKey) return
      const items = suggestedIntegrations.getLinkedRecords<ISuggestedIntegrationJira[] | null>(
        'items'
      )
      if (!items) return
      const existingIntegration = items.find(
        (item) => item && item.getValue('projectKey') === projectKey
      )
      const hasMore = suggestedIntegrations.getValue('hasMore')
      if (!existingIntegration || !hasMore) {
        const projectName = integration.getValue('projectName')
        const cloudId = integration.getValue('cloudId')
        if (!projectName || !cloudId) return
        const nextItem = {
          cloudId,
          projectKey,
          projectName,
          service: TaskServiceEnum.jira
        }
        const id = makeSuggestedIntegrationId(nextItem)
        // the fallback is likely never used
        const latestIntegration =
          store.get(id) ||
          createProxyRecord(store, 'SuggestedIntegrationJira', {
            id,
            ...nextItem
          })
        const nextSuggestedIntegrations = [latestIntegration, ...items].slice(0, hasMore ? 3 : 1)
        suggestedIntegrations.setLinkedRecords(nextSuggestedIntegrations, 'items')
        suggestedIntegrations.setValue(true, 'hasMore')
      }
    },
    optimisticUpdater: (store) => {
      const {cloudId, projectKey, taskId} = variables
      const now = new Date()
      const task = store.get(taskId)
      if (!task) return
      const optimisticIntegration = {
        service: TaskServiceEnum.jira,
        projectKey,
        cloudId,
        issueKey: '?',
        cloudName: '',
        updatedAt: now.toJSON()
      }
      const integration = createProxyRecord(store, 'TaskIntegrationJira', optimisticIntegration)
      task.setLinkedRecord(integration, 'integration')
    },
    onCompleted,
    onError
  })
}

export default CreateJiraTaskIntegrationMutation
