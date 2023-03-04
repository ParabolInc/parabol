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
      RemoveTeamMemberPayload {
        ...RemoveTeamMemberMutation_task @relay(mask: false)
      }
      ChangeTaskTeamPayload {
        ...ChangeTaskTeamMutation_task @relay(mask: false)
      }
      CreateTaskIntegrationPayload {
        ...CreateTaskIntegrationMutation_task @relay(mask: false)
      }
      CreateTaskPayload {
        ...CreateTaskMutation_task @relay(mask: false)
      }
      DeleteTaskPayload {
        ...DeleteTaskMutation_task @relay(mask: false)
      }
      EditTaskPayload {
        ...EditTaskMutation_task @relay(mask: false)
      }
      RemoveOrgUserPayload {
        ...RemoveOrgUserMutation_task @relay(mask: false)
      }
      UpdateTaskPayload {
        ...UpdateTaskMutation_task @relay(mask: false)
      }
      UpdateTaskDueDatePayload {
        ...UpdateTaskDueDateMutation_task @relay(mask: false)
      }
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
      updater?.(payload[type], context)
    },
    onNext: (result) => {
      if (!result) return
      const {taskSubscription} = result
      const type = taskSubscription.__typename as keyof typeof taskSubscription
      const handler = onNextHandlers[type as keyof typeof onNextHandlers]
      if (handler) {
        handler(taskSubscription[type] as any, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(TaskSubscription.name, variables)
    }
  })
}
TaskSubscription.key = 'task'
export default TaskSubscription
