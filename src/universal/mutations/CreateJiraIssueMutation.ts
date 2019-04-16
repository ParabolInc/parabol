import {commitMutation, graphql} from 'react-relay'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import Atmosphere from 'universal/Atmosphere'
import {LocalHandlers} from 'universal/types/relayMutations'

graphql`
  fragment CreateGitHubIssueMutation_task on CreateGitHubIssuePayload {
    task {
      integration {
        issueNumber
        service
        nameWithOwner
      }
      updatedAt
    }
  }
`

const mutation = graphql`
  mutation CreateGitHubIssueMutation($nameWithOwner: String!, $taskId: ID!) {
    createGitHubIssue(nameWithOwner: $nameWithOwner, taskId: $taskId) {
      error {
        message
      }
      ...CreateGitHubIssueMutation_task @relay(mask: false)
    }
  }
`

const CreateGitHubIssueMutation = (atmosphere: Atmosphere, variables: any, {onCompleted, onError}: LocalHandlers) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {cloudId, projectKey, taskId} = variables
      const now = new Date()
      const task = store.get(taskId)
      if (!task) return
      const optimisticIntegration = {
        service: IService.atlassian,
        projectKey,
        cloudId,
        issueKey: '?',
        updatedAt: now.toJSON()
      }
      const integration = createProxyRecord(store, 'JiraTask', optimisticIntegration)
      task.setLinkedRecord(integration, 'integration')
    },
    onCompleted,
    onError
  })
}

export default CreateGitHubIssueMutation
