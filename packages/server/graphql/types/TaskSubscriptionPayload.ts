import graphQLSubscriptionType from '../graphQLSubscriptionType'
import ChangeTaskTeamPayload from './ChangeTaskTeamPayload'
import CreateTaskIntegrationPayload from './CreateTaskIntegrationPayload'
import CreateTaskPayload from './CreateTaskPayload'
import DeleteTaskPayload from './DeleteTaskPayload'
import EditTaskPayload from './EditTaskPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import RemoveTeamMemberPayload from './RemoveTeamMemberPayload'
import UpdateTaskDueDatePayload from './UpdateTaskDueDatePayload'
import UpdateTaskPayload from './UpdateTaskPayload'

const types = [
  ChangeTaskTeamPayload,
  CreateTaskIntegrationPayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  EditTaskPayload,
  RemoveOrgUserPayload,
  RemoveTeamMemberPayload,
  UpdateTaskPayload,
  UpdateTaskDueDatePayload
]

export default graphQLSubscriptionType('TaskSubscriptionPayload', types)
