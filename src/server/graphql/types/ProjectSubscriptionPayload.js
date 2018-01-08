import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import CreateGitHubIssuePayload from 'server/graphql/types/CreateGitHubIssuePayload';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import EditProjectPayload from 'server/graphql/types/EditProjectPayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberExMemberPayload';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';

const types = [
  CreateGitHubIssuePayload,
  CreateProjectPayload,
  DeleteProjectPayload,
  EditProjectPayload,
  EndMeetingPayload,
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload,
  UpdateProjectPayload
];

export default new GraphQLSubscriptionType('ProjectSubscriptionPayload', types);

