import {CreateGitHubIssueMutation} from '__generated__/CreateGitHubIssueMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import {ICreateGitHubIssueOnMutationArguments, TaskServiceEnum} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'

graphql`
  fragment CreateGitHubIssueMutation_task on CreateGitHubIssuePayload {
    task {
      integration {
        ... on TaskIntegrationGitHub {
          issueNumber
          service
          nameWithOwner
        }
        ...TaskIntegrationLinkIntegrationGitHub
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

const CreateGitHubIssueMutation = (
  atmosphere: Atmosphere,
  variables: ICreateGitHubIssueOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
) => {
  return commitMutation<CreateGitHubIssueMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {nameWithOwner, taskId} = variables
      const now = new Date()
      const task = store.get(taskId)
      if (!task) return
      const optimisticIntegration = {
        service: TaskServiceEnum.github,
        nameWithOwner,
        issueNumber: '?',
        updatedAt: now.toJSON()
      }
      const integration = createProxyRecord(store, 'TaskIntegrationGitHub', optimisticIntegration)
      task.setLinkedRecord(integration, 'integration')
    },
    onCompleted,
    onError
  })
}

export default CreateGitHubIssueMutation
