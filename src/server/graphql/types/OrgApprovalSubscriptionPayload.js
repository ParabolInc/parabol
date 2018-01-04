import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';

const types = [
  ApproveToOrgPayload,
  CancelApprovalPayload,
  InviteTeamMembersPayload
];

export default new GraphQLSubscriptionType('OrgApprovalSubscriptionPayload', types);
