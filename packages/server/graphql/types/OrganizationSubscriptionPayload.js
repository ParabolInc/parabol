import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AddOrgPayload from './AddOrgPayload'
import SetOrgUserRoleAddedPayload from './SetOrgUserRoleAddedPayload'
import SetOrgUserRoleRemovedPayload from './SetOrgUserRoleRemovedPayload'
import UpdateOrgPayload from './UpdateOrgPayload'
import UpgradeToProPayload from './UpgradeToProPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import UpdateCreditCardPayload from './UpdateCreditCardPayload'
import DowngradeToPersonalPayload from './DowngradeToPersonalPayload'

const types = [
  AddOrgPayload,
  DowngradeToPersonalPayload,
  RemoveOrgUserPayload,
  SetOrgUserRoleAddedPayload,
  SetOrgUserRoleRemovedPayload,
  UpdateCreditCardPayload,
  UpdateOrgPayload,
  UpgradeToProPayload
]

export default graphQLSubscriptionType('OrganizationSubscriptionPayload', types)
