import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import SetOrgUserRoleAddedPayload from 'server/graphql/types/SetOrgUserRoleAddedPayload';
import SetOrgUserRoleAnnoucePayload from 'server/graphql/types/SetOrgUserRoleAnnoucePayload';
import SetOrgUserRoleRemovedPayload from 'server/graphql/types/SetOrgUserRoleRemovedPayload';

const types = [
  AddOrgPayload,
  ApproveToOrgPayload,
  SetOrgUserRoleAddedPayload,
  SetOrgUserRoleRemovedPayload,
  SetOrgUserRoleAnnoucePayload
];

export default new GraphQLSubscriptionType('OrganizationSubscriptionPayload', types);
