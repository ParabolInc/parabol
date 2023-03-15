import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription} from 'relay-runtime'
import {
  TaskSubscription as TTaskSubscription,
  TaskSubscription$variables
} from '~/__generated__/TaskSubscription.graphql'
import Atmosphere from '../Atmosphere'
import {changeTaskTeamTaskUpdater} from '../mutations/ChangeTaskTeamMutation'
import {createTaskTaskUpdater} from '../mutations/CreateTaskMutation'
import {deleteTaskTaskUpdater} from '../mutations/DeleteTaskMutation'
import {editTaskTaskUpdater} from '../mutations/EditTaskMutation'
import {removeOrgUserTaskUpdater} from '../mutations/RemoveOrgUserMutation'
import {updateTaskTaskOnNext, updateTaskTaskUpdater} from '../mutations/UpdateTaskMutation'
import subscriptionOnNext from './subscriptionOnNext'
import subscriptionUpdater from './subscriptionUpdater'

const subscription = graphql`
  subscription TaskSubscription {
    taskSubscription {
      fieldName
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
  variables: TaskSubscription$variables,
  router: {history: RouterProps['history']}
) => {
  atmosphere.registerSubscription(subscription)
  return requestSubscription<TTaskSubscription>(atmosphere, {
    subscription,
    variables,
    updater: subscriptionUpdater('taskSubscription', updateHandlers, atmosphere),
    onNext: subscriptionOnNext('taskSubscription', onNextHandlers, atmosphere, router),
    onCompleted: () => {
      atmosphere.unregisterSub(TaskSubscription.name, variables)
    }
  })
}
TaskSubscription.key = 'task'
export default TaskSubscription
