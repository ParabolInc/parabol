import graphQLSubscriptionType from '../graphQLSubscriptionType'
import ChangeTaskTeamPayload from './ChangeTaskTeamPayload'
import CreateGitHubIssuePayload from './CreateGitHubIssuePayload'
import CreateTaskPayload from './CreateTaskPayload'
import DeleteTaskPayload from './DeleteTaskPayload'
import EditTaskPayload from './EditTaskPayload'
import UpdateTaskPayload from './UpdateTaskPayload'
import RemoveTeamMemberPayload from './RemoveTeamMemberPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import UpdateTaskDueDatePayload from './UpdateTaskDueDatePayload'
import CreateJiraIssuePayload from './CreateJiraIssuePayload'

const types = [
  ChangeTaskTeamPayload,
  CreateGitHubIssuePayload,
  CreateJiraIssuePayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  EditTaskPayload,
  RemoveOrgUserPayload,
  RemoveTeamMemberPayload,
  UpdateTaskPayload,
  UpdateTaskDueDatePayload
]

export default graphQLSubscriptionType('TaskSubscriptionPayload', types)
