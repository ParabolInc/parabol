import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import CreateGitHubIssuePayload from 'server/graphql/types/CreateGitHubIssuePayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberSelfPayload';

const types = [
  CreateGitHubIssuePayload,
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload
];

export default new GraphQLSubscriptionType('ProjectSubscriptionPayload', types);

