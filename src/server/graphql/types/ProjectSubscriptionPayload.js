import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType';
import CreateGitHubIssuePayload from 'server/graphql/types/CreateGitHubIssuePayload';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import EditProjectPayload from 'server/graphql/types/EditProjectPayload';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';

const types = [
  CancelApprovalPayload,
  CreateGitHubIssuePayload,
  CreateProjectPayload,
  DeleteProjectPayload,
  EditProjectPayload,
  EndMeetingPayload,
  RemoveOrgUserPayload,
  RemoveTeamMemberPayload,
  UpdateProjectPayload
];

export default graphQLSubscriptionType('ProjectSubscriptionPayload', types);

