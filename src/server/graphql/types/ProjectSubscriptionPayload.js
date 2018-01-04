import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberSelfPayload';

const types = [
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload
];

export default new GraphQLSubscriptionType('ProjectSubscriptionPayload', types);

