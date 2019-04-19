import {commitMutation, graphql} from 'react-relay'
import {TaskServiceEnum} from 'universal/types/graphql'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import Atmosphere from 'universal/Atmosphere'
import {LocalHandlers} from 'universal/types/relayMutations'

graphql`
  fragment CreateJiraIssueMutation_task on CreateJiraIssuePayload {
    task {
      integration {
        service
        ...TaskIntegrationLinkIntegrationJira
      }
      updatedAt
    }
  }
`

const mutation = graphql`
  mutation CreateJiraIssueMutation($cloudId: ID!, $taskId: ID!, $projectKey: ID!) {
    createJiraIssue(cloudId: $cloudId, taskId: $taskId, projectKey: $projectKey) {
      error {
        message
      }
      ...CreateJiraIssueMutation_task @relay(mask: false)
    }
  }
`

const CreateJiraIssueMutation = (
  atmosphere: Atmosphere,
  variables: any,
  {onCompleted, onError}: LocalHandlers
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
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

export default CreateJiraIssueMutation
