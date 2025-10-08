import graphql from 'babel-plugin-relay/macro'
import {changeTaskTeamTaskUpdater} from '../mutations/ChangeTaskTeamMutation'
import {createTaskTaskUpdater} from '../mutations/CreateTaskMutation'
import {deleteTaskTaskUpdater} from '../mutations/DeleteTaskMutation'
import {editTaskTaskUpdater} from '../mutations/EditTaskMutation'
import {removeOrgUsersTaskUpdater} from '../mutations/RemoveOrgUsersMutation'
import {updateTaskTaskOnNext, updateTaskTaskUpdater} from '../mutations/UpdateTaskMutation'
import {createSubscription} from './createSubscription'

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
      RemoveOrgUsersSuccess {
        ...RemoveOrgUsersMutation_task @relay(mask: false)
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
  RemoveOrgUsersSuccess: removeOrgUsersTaskUpdater,
  UpdateTaskPayload: updateTaskTaskUpdater
} as const

export default createSubscription(subscription, onNextHandlers, updateHandlers)
