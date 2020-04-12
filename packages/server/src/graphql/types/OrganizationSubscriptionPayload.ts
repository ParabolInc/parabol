import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AddOrgPayload from './AddOrgPayload'
import SetOrgUserRoleAddedPayload from './SetOrgUserRoleAddedPayload'
import SetOrgUserRoleRemovedPayload from './SetOrgUserRoleRemovedPayload'
import UpdateOrgPayload from './UpdateOrgPayload'
import UpgradeToProPayload from './UpgradeToProPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import UpdateCreditCardPayload from './UpdateCreditCardPayload'
import DowngradeToPersonalPayload from './DowngradeToPersonalPayload'
import PayLaterPayload from './PayLaterPayload'
import ArchiveOrganizationPayload from './ArchiveOrganizationPayload'

const types = [
  AddOrgPayload,
  ArchiveOrganizationPayload,
  DowngradeToPersonalPayload,
  PayLaterPayload,
  RemoveOrgUserPayload,
  SetOrgUserRoleAddedPayload,
  SetOrgUserRoleRemovedPayload,
  UpdateCreditCardPayload,
  UpdateOrgPayload,
  UpgradeToProPayload
]

export default graphQLSubscriptionType('OrganizationSubscriptionPayload', types)
