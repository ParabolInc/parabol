import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import ResendTeamInvitePayload from 'server/graphql/types/ResendTeamInvitePayload';

const types = [
  ApproveToOrgPayload,
  CancelTeamInvitePayload,
  InviteTeamMembersPayload,
  ResendTeamInvitePayload
];

export default new GraphQLSubscriptionType('InvitationSubscriptionPayload', types);
