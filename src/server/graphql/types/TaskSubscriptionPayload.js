import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import ChangeTaskTeamPayload from 'server/graphql/types/ChangeTaskTeamPayload'
import CreateGitHubIssuePayload from 'server/graphql/types/CreateGitHubIssuePayload'
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload'
import DeleteTaskPayload from 'server/graphql/types/DeleteTaskPayload'
import EditTaskPayload from 'server/graphql/types/EditTaskPayload'
import UpdateTaskPayload from 'server/graphql/types/UpdateTaskPayload'
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload'
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload'
import UpdateTaskDueDatePayload from 'server/graphql/types/UpdateTaskDueDatePayload'
import CreateJiraIssuePayload from 'server/graphql/types/CreateJiraIssuePayload'

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
