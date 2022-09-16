import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {RecordSourceSelectorProxy, requestSubscription} from 'relay-runtime'
import {
  TaskSubscription as TTaskSubscription,
  TaskSubscriptionVariables
} from '~/__generated__/TaskSubscription.graphql'
import Atmosphere from '../Atmosphere'
import {changeTaskTeamTaskUpdater} from '../mutations/ChangeTaskTeamMutation'
import {createTaskTaskUpdater} from '../mutations/CreateTaskMutation'
import {deleteTaskTaskUpdater} from '../mutations/DeleteTaskMutation'
import {editTaskTaskUpdater} from '../mutations/EditTaskMutation'
import {removeOrgUserTaskUpdater} from '../mutations/RemoveOrgUserMutation'
import {updateTaskTaskOnNext, updateTaskTaskUpdater} from '../mutations/UpdateTaskMutation'

const subscription = graphql`
  subscription TaskSubscription {
    taskSubscription {
      __typename
      ...RemoveTeamMemberMutation_task @relay(mask: false)
      ...ChangeTaskTeamMutation_task @relay(mask: false)
      ...CreateTaskIntegrationMutation_task @relay(mask: false)
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
} as const

const TaskSubscription = (
  atmosphere: Atmosphere,
  variables: TaskSubscriptionVariables,
  router: {history: RouterProps['history']}
) => {
  const {viewerId} = atmosphere
  return requestSubscription<TTaskSubscription>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('taskSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename')
      const context = {atmosphere, store: store as RecordSourceSelectorProxy<any>}
      switch (type) {
        case 'CreateTaskIntegrationPayload':
          break
        case 'ChangeTaskTeamPayload':
          changeTaskTeamTaskUpdater(payload, context)
          break
        case 'CreateTaskPayload':
          createTaskTaskUpdater(payload, context)
          break
        case 'DeleteTaskPayload':
          deleteTaskTaskUpdater(payload, store)
          break
        case 'EditTaskPayload':
          editTaskTaskUpdater(payload, store)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserTaskUpdater(payload, store, viewerId)
          break
        case 'UpdateTaskPayload':
          updateTaskTaskUpdater(payload, context)
          break
        case 'UpdateTaskDueDatePayload':
          break
        default:
          console.error('TaskSubscription case fail', type)
      }
    },
    onNext: (result) => {
      if (!result) return
      const {taskSubscription} = result
      const {__typename: type} = taskSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(taskSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(TaskSubscription.name, variables)
    }
  })
}
TaskSubscription.key = 'task'
export default TaskSubscription
