import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import SetOrgUserRoleAddedPayload from 'server/graphql/types/SetOrgUserRoleAddedPayload';
import SetOrgUserRoleAnnouncePayload from 'server/graphql/types/SetOrgUserRoleAnnouncePayload';
import SetOrgUserRoleRemovedPayload from 'server/graphql/types/SetOrgUserRoleRemovedPayload';
import UpdateOrgPayload from 'server/graphql/types/UpdateOrgPayload';
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload';

const types = [
  AddOrgPayload,
  ApproveToOrgPayload,
  SetOrgUserRoleAddedPayload,
  SetOrgUserRoleRemovedPayload,
  SetOrgUserRoleAnnouncePayload,
  UpdateOrgPayload,
  UpgradeToProPayload
];

export default new GraphQLSubscriptionType('OrganizationSubscriptionPayload', types);
