import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import CreateGitHubIssuePayload from 'server/graphql/types/CreateGitHubIssuePayload';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import EditProjectPayload from 'server/graphql/types/EditProjectPayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberSelfPayload';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';

const types = [
  CreateGitHubIssuePayload,
  CreateProjectPayload,
  DeleteProjectPayload,
  EditProjectPayload,
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload,
  UpdateProjectPayload
];

export default new GraphQLSubscriptionType('ProjectSubscriptionPayload', types);

