import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AddOrgPayload from './AddOrgPayload'
import ArchiveOrganizationPayload from './ArchiveOrganizationPayload'
import DowngradeToStarterPayload from './DowngradeToStarterPayload'
import PayLaterPayload from './PayLaterPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import SetOrgUserRoleAddedPayload from './SetOrgUserRoleAddedPayload'
import SetOrgUserRoleRemovedPayload from './SetOrgUserRoleRemovedPayload'
import UpdateCreditCardPayload from './UpdateCreditCardPayload'
import UpdateOrgPayload from './UpdateOrgPayload'
import {UpdateTemplateScopeSuccess} from './UpdateTemplateScopePayload'
import UpgradeToTeamTierPayload from './UpgradeToTeamTierPayload'

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
  UpgradeToTeamTierPayload,
  UpdateTemplateScopeSuccess
]

export default graphQLSubscriptionType('OrganizationSubscriptionPayload', types)
