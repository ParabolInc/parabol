import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';

const types = [
  ApproveToOrgPayload,
  CancelTeamInvitePayload
];

export default new GraphQLSubscriptionType('InvitationSubscriptionPayload', types);
