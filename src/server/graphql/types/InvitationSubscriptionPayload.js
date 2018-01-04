import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';

const types = [
  ApproveToOrgPayload,
  CancelTeamInvitePayload,
  InviteTeamMembersPayload
];

export default new GraphQLSubscriptionType('InvitationSubscriptionPayload', types);
