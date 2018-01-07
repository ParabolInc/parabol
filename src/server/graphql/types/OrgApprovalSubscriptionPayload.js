import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import InviteTeamMembersAnnouncePayload from 'server/graphql/types/InviteTeamMembersAnnoucePayload';
import RejectOrgApprovalInviterPayload from 'server/graphql/types/RejectOrgApprovalInviterPayload';
import RejectOrgApprovalOrgLeaderPayload from 'server/graphql/types/RejectOrgApprovalOrgLeaderPayload';

const types = [
  ApproveToOrgPayload,
  CancelApprovalPayload,
  InviteTeamMembersAnnouncePayload,
  RejectOrgApprovalInviterPayload,
  RejectOrgApprovalOrgLeaderPayload
];

export default new GraphQLSubscriptionType('OrgApprovalSubscriptionPayload', types);
