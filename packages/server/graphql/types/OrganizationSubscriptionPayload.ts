import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AddOrgPayload from './AddOrgPayload'
import ArchiveOrganizationPayload from './ArchiveOrganizationPayload'
import DowngradeToStarterPayload from './downgradeToStarterPayload'
import PayLaterPayload from './PayLaterPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import SetOrgUserRoleAddedPayload from './SetOrgUserRoleAddedPayload'
import SetOrgUserRoleRemovedPayload from './SetOrgUserRoleRemovedPayload'
import UpdateCreditCardPayload from './UpdateCreditCardPayload'
import UpdateOrgPayload from './UpdateOrgPayload'
import {UpdateTemplateScopeSuccess} from './UpdateTemplateScopePayload'
import UpgradeToProPayload from './UpgradeToProPayload'

const types = [
  AddOrgPayload,
  ArchiveOrganizationPayload,
  DowngradeToStarterPayload,
  PayLaterPayload,
  RemoveOrgUserPayload,
  SetOrgUserRoleAddedPayload,
  SetOrgUserRoleRemovedPayload,
  UpdateCreditCardPayload,
  UpdateOrgPayload,
  UpgradeToProPayload,
  UpdateTemplateScopeSuccess
]

export default graphQLSubscriptionType('OrganizationSubscriptionPayload', types)
