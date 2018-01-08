import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import CreateGitHubIssuePayload from 'server/graphql/types/CreateGitHubIssuePayload';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import EditProjectPayload from 'server/graphql/types/EditProjectPayload';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload';

const types = [
  CreateGitHubIssuePayload,
  CreateProjectPayload,
  DeleteProjectPayload,
  EditProjectPayload,
  EndMeetingPayload,
  RemoveTeamMemberPayload,
  UpdateProjectPayload
];

export default new GraphQLSubscriptionType('ProjectSubscriptionPayload', types);

