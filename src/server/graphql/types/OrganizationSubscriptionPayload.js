import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import SetOrgUserRoleAddedPayload from 'server/graphql/types/SetOrgUserRoleAddedPayload';
import SetOrgUserRoleRemovedPayload from 'server/graphql/types/SetOrgUserRoleRemovedPayload';
import UpdateOrgPayload from 'server/graphql/types/UpdateOrgPayload';
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';

const types = [
  AddOrgPayload,
  ApproveToOrgPayload,
  RemoveOrgUserPayload,
  SetOrgUserRoleAddedPayload,
  SetOrgUserRoleRemovedPayload,
  UpdateOrgPayload,
  UpgradeToProPayload
];

export default graphQLSubscriptionType('OrganizationSubscriptionPayload', types);
