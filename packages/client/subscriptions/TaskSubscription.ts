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

const updateHandlers = {
  ChangeTaskTeamPayload: changeTaskTeamTaskUpdater,
  CreateTaskPayload: createTaskTaskUpdater,
  DeleteTaskPayload: deleteTaskTaskUpdater,
  EditTaskPayload: editTaskTaskUpdater,
  RemoveOrgUserPayload: removeOrgUserTaskUpdater,
  UpdateTaskPayload: updateTaskTaskUpdater
} as const

const TaskSubscription = (
  atmosphere: Atmosphere,
  variables: TaskSubscriptionVariables,
  router: {history: RouterProps['history']}
) => {
  return requestSubscription<TTaskSubscription>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('taskSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename') as keyof typeof updateHandlers
      const context = {atmosphere, store: store as RecordSourceSelectorProxy<any>}
      const updater = updateHandlers[type]
      updater?.(payload, context)
    },
    onNext: (result) => {
      if (!result) return
      const {taskSubscription} = result
      const {__typename: type} = taskSubscription
      const handler = onNextHandlers[type as keyof typeof onNextHandlers]
      if (handler) {
        handler(taskSubscription as any, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(TaskSubscription.name, variables)
    }
  })
}
TaskSubscription.key = 'task'
export default TaskSubscription
