import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
graphql`
  fragment UpdateTaskDueDateMutation_task on UpdateTaskDueDatePayload {
    task {
      id
      dueDate
    }
  }
`

const mutation = graphql`
  mutation UpdateTaskDueDateMutation($taskId: ID!, $dueDate: DateTime) {
    updateTaskDueDate(taskId: $taskId, dueDate: $dueDate) {
      error {
        message
      }
      ...UpdateTaskDueDateMutation_task @relay(mask: false)
    }
  }
`

const UpdateTaskDueDateMutation = (environment, variables, onCompleted, onError) => {
  return commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {taskId, dueDate} = variables
      const task = store.get(taskId)
      if (!task) return
      const nextDueDate = dueDate ? dueDate.toJSON() : undefined
      task.setValue(nextDueDate, 'dueDate')
    },
    onCompleted,
    onError
  })
}

export default UpdateTaskDueDateMutation
