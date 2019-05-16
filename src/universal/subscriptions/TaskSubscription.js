import {createTaskTaskUpdater} from 'universal/mutations/CreateTaskMutation'
import {deleteTaskTaskUpdater} from 'universal/mutations/DeleteTaskMutation'
import {editTaskTaskUpdater} from 'universal/mutations/EditTaskMutation'
import {updateTaskTaskOnNext, updateTaskTaskUpdater} from 'universal/mutations/UpdateTaskMutation'
import {removeOrgUserTaskUpdater} from 'universal/mutations/RemoveOrgUserMutation'
import {changeTaskTeamTaskUpdater} from 'universal/mutations/ChangeTaskTeamMutation'

const subscription = graphql`
  subscription TaskSubscription {
    taskSubscription {
      __typename
      ...RemoveTeamMemberMutation_task @relay(mask: false)
      ...ChangeTaskTeamMutation_task @relay(mask: false)
      ...CreateGitHubIssueMutation_task @relay(mask: false)
      ...CreateJiraIssueMutation_task @relay(mask: false)
      ...CreateTaskMutation_task @relay(mask: false)
      ...DeleteTaskMutation_task @relay(mask: false)
      ...EditTaskMutation_task @relay(mask: false)
      ...RemoveOrgUserMutation_task @relay(mask: false)
      ...UpdateTaskMutation_task @relay(mask: false)
      ...UpdateTaskDueDateMutation_task @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  UpdateTaskPayload: updateTaskTaskOnNext
}

const TaskSubscription = (atmosphere, queryVariables, subParams) => {
  const {viewerId} = atmosphere
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('taskSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      switch (type) {
        case 'CreateGitHubIssuePayload':
          break
        case 'ChangeTaskTeamPayload':
          changeTaskTeamTaskUpdater(payload, {store})
          break
        case 'CreateTaskPayload':
          createTaskTaskUpdater(payload, store, viewerId, false)
          break
        case 'DeleteTaskPayload':
          deleteTaskTaskUpdater(payload, store, viewerId)
          break
        case 'EditTaskPayload':
          editTaskTaskUpdater(payload, store)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserTaskUpdater(payload, store, viewerId)
          break
        case 'UpdateTaskPayload':
          updateTaskTaskUpdater(payload, store, viewerId)
          break
        case 'UpdateTaskDueDatePayload':
          break
        default:
          console.error('TaskSubscription case fail', type)
      }
    },
    onNext: ({taskSubscription}) => {
      const {__typename: type} = taskSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(taskSubscription, {...subParams, atmosphere})
      }
    }
  }
}

export default TaskSubscription
