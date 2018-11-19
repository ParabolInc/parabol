import {createTaskTaskUpdater} from 'universal/mutations/CreateTaskMutation'
import {deleteTaskTaskUpdater} from 'universal/mutations/DeleteTaskMutation'
import {editTaskTaskUpdater} from 'universal/mutations/EditTaskMutation'
import {removeTeamMemberTasksUpdater} from 'universal/mutations/RemoveTeamMemberMutation'
import {updateTaskTaskUpdater} from 'universal/mutations/UpdateTaskMutation'
import {endMeetingTaskUpdater} from 'universal/mutations/EndMeetingMutation'
import {removeOrgUserTaskUpdater} from 'universal/mutations/RemoveOrgUserMutation'
import {cancelApprovalTaskUpdater} from 'universal/mutations/CancelApprovalMutation'
import {rejectOrgApprovalTaskUpdater} from 'universal/mutations/RejectOrgApprovalMutation'
import {cancelTeamInviteTaskUpdater} from 'universal/mutations/CancelTeamInviteMutation'
import {inviteTeamMembersTaskUpdater} from 'universal/mutations/InviteTeamMembersMutation'
import {acceptTeamInviteTaskUpdater} from 'universal/mutations/AcceptTeamInviteMutation'
import {changeTaskTeamTaskUpdater} from 'universal/mutations/ChangeTaskTeamMutation'

const subscription = graphql`
  subscription TaskSubscription {
    taskSubscription {
      __typename
      ...AcceptTeamInviteMutation_task @relay(mask: false)
      ...RemoveTeamMemberMutation_task @relay(mask: false)
      ...CancelApprovalMutation_task @relay(mask: false)
      ...CancelTeamInviteMutation_task @relay(mask: false)
      ...ChangeTaskTeamMutation_task @relay(mask: false)
      ...CreateGitHubIssueMutation_task @relay(mask: false)
      ...CreateTaskMutation_task @relay(mask: false)
      ...DeleteTaskMutation_task @relay(mask: false)
      ...EditTaskMutation_task @relay(mask: false)
      ...EndMeetingMutation_task @relay(mask: false)
      ...InviteTeamMembersMutation_task @relay(mask: false)
      ...RejectOrgApprovalMutation_task @relay(mask: false)
      ...RemoveOrgUserMutation_task @relay(mask: false)
      ...UpdateTaskMutation_task @relay(mask: false)
      ...UpdateTaskDueDateMutation_task @relay(mask: false)
    }
  }
`

const onNextHandlers = {}

const TaskSubscription = (atmosphere, queryVariables, subParams) => {
  const {dispatch, history, location} = subParams
  const {viewerId} = atmosphere
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('taskSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      switch (type) {
        case 'AcceptTeamInvitePayload':
          acceptTeamInviteTaskUpdater(payload, store, viewerId)
          break
        case 'RemoveTeamMemberOtherPayload':
          removeTeamMemberTasksUpdater(payload, store, viewerId)
          break
        case 'CancelApprovalPayload':
          cancelApprovalTaskUpdater(payload, store, viewerId)
          break
        case 'CancelTeamInvitePayload':
          cancelTeamInviteTaskUpdater(payload, store, viewerId)
          break
        case 'CreateGitHubIssuePayload':
          break
        case 'ChangeTaskTeamPayload':
          changeTaskTeamTaskUpdater(payload, store, viewerId)
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
        case 'EndMeetingPayload':
          endMeetingTaskUpdater(payload, store, viewerId)
          break
        case 'InviteTeamMembersPayload':
          inviteTeamMembersTaskUpdater(payload, store, viewerId)
          break
        case 'RejectOrgApprovalPayload':
          rejectOrgApprovalTaskUpdater(payload, store, viewerId)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserTaskUpdater(payload, store, viewerId)
          break
        case 'UpdateTaskPayload':
          updateTaskTaskUpdater(payload, store, viewerId, {
            dispatch,
            history,
            location
          })
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
