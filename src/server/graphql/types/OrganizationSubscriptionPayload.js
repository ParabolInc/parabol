import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AddOrgCreatorPayload from 'server/graphql/types/AddOrgCreatorPayload';
import AddOrgInviteePayload from 'server/graphql/types/AddOrgInviteePayload';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import SetOrgUserRoleAddedPayload from 'server/graphql/types/SetOrgUserRoleAddedPayload';
import SetOrgUserRoleAnnouncePayload from 'server/graphql/types/SetOrgUserRoleAnnouncePayload';
import SetOrgUserRoleRemovedPayload from 'server/graphql/types/SetOrgUserRoleRemovedPayload';
import UpdateOrgPayload from 'server/graphql/types/UpdateOrgPayload';
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload';

const types = [
  AddOrgCreatorPayload,
  AddOrgInviteePayload,
  ApproveToOrgPayload,
  SetOrgUserRoleAddedPayload,
  SetOrgUserRoleRemovedPayload,
  SetOrgUserRoleAnnouncePayload,
  UpdateOrgPayload,
  UpgradeToProPayload
];

export default new GraphQLSubscriptionType('OrganizationSubscriptionPayload', types);
