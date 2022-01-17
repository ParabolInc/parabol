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
          project {
            name
          }
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
