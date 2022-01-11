import makeRepoIntegrationId from 'parabol-client/utils/makeRepoIntegrationId'
import graphql from 'babel-plugin-relay/macro'
import {stateToHTML} from 'draft-js-export-html'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import splitDraftContent from '../utils/draftjs/splitDraftContent'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {CreateJiraTaskIntegrationMutation as TCreateJiraTaskIntegrationMutation} from '../__generated__/CreateJiraTaskIntegrationMutation.graphql'

graphql`
  fragment CreateJiraTaskIntegrationMutation_task on CreateJiraTaskIntegrationPayload {
    task {
      ...IntegratedTaskContent_task
      integration {
        __typename
        ... on JiraIssue {
          cloudId
          cloudName
          url
          issueKey
          summary
          descriptionHTML
          projectKey
          # project {
          #   name
          # }
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

const CreateJiraTaskIntegrationMutation: StandardMutation<TCreateJiraTaskIntegrationMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
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
      const repoIntegrations = user.getLinkedRecord('repoIntegrations', {teamId})
      const projectKey = integration.getValue('projectKey')
      if (!repoIntegrations || !projectKey) return
      const items = repoIntegrations.getLinkedRecords('items')
      if (!items) return
      const existingIntegration = items.find(
        (item) => item && item.getValue('projectKey') === projectKey
      )
      const hasMore = repoIntegrations.getValue('hasMore')
      if (!existingIntegration || !hasMore) {
        const project = integration.getLinkedRecord('project')
        if (!project) return
        const projectName = project.getValue('projectName')
        const cloudId = integration.getValue('cloudId')
        if (!projectName || !cloudId) return
        const nextItem = {
          cloudId,
          projectKey,
          projectName,
          service: 'jira'
        } as const
        const id = makeRepoIntegrationId(nextItem)
        // the fallback is likely never used
        const latestIntegration =
          store.get(id) ||
          createProxyRecord(store, 'RepoIntegrationJira', {
            id,
            ...nextItem
          })
        const nextRepoIntegrations = [latestIntegration, ...items].slice(0, hasMore ? 3 : 1)
        repoIntegrations.setLinkedRecords(nextRepoIntegrations, 'items')
        repoIntegrations.setValue(true, 'hasMore')
      }
    },
    optimisticUpdater: (store) => {
      const {cloudId, projectKey, taskId} = variables
      const now = new Date()
      const task = store.get(taskId)
      if (!task) return
      const contentStr = task.getValue('content') as string
      if (!contentStr) return
      const {title: summary, contentState} = splitDraftContent(contentStr)
      const descriptionHTML = stateToHTML(contentState)
      const optimisticIntegration = {
        summary,
        descriptionHTML,
        projectKey,
        cloudId,
        issueKey: '?',
        cloudName: '',
        updatedAt: now.toJSON()
      } as const
      const integration = createProxyRecord(store, 'JiraIssue', optimisticIntegration)
      task.setLinkedRecord(integration, 'integration')
    },
    onCompleted,
    onError
  })
}

export default CreateJiraTaskIntegrationMutation
