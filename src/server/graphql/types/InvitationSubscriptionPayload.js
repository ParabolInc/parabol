import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import InviteTeamMembersAnnouncePayload from 'server/graphql/types/InviteTeamMembersAnnoucePayload';
import ResendTeamInvitePayload from 'server/graphql/types/ResendTeamInvitePayload';

const types = [
  ApproveToOrgPayload,
  CancelTeamInvitePayload,
  InviteTeamMembersAnnouncePayload,
  ResendTeamInvitePayload
];

export default new GraphQLSubscriptionType('InvitationSubscriptionPayload', types);
