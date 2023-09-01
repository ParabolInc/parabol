import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {BatchArchiveTasksMutation as TBatchArchiveTasksMutation} from '../__generated__/BatchArchiveTasksMutation.graphql'

graphql`
  fragment BatchArchiveTasksMutation_task on BatchArchiveTasksSuccess {
    tasks {
      id
    }
  }
`

const mutation = graphql`
  mutation BatchArchiveTasksMutation($taskIds: [ID!]!) {
    batchArchiveTasks(taskIds: $taskIds) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...BatchArchiveTasksMutation_task @relay(mask: false)
    }
  }
`

const BatchArchiveTasksMutation: StandardMutation<TBatchArchiveTasksMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TBatchArchiveTasksMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('batchArchiveTasks')
      if (!payload) return
    },
    optimisticUpdater: (store) => {
      const payload = store.getRootField('batchArchiveTasks')
      if (!payload) return
    },
    onCompleted,
    onError
  })
}

export default BatchArchiveTasksMutation
