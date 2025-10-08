import graphql from 'babel-plugin-relay/macro'
import {
  archiveOrganizationOrganizationOnNext,
  archiveOrganizationOrganizationUpdater
} from '~/mutations/ArchiveOrganizationMutation'
import {
  removeOrgUsersOrganizationOnNext,
  removeOrgUsersOrganizationUpdater
} from '../mutations/RemoveOrgUsersMutation'
import {
  setOrgUserRoleAddedOrganizationOnNext,
  setOrgUserRoleAddedOrganizationUpdater
} from '../mutations/SetOrgUserRoleMutation'
import {updateTemplateScopeOrganizationUpdater} from '../mutations/UpdateReflectTemplateScopeMutation'
import {createSubscription} from './createSubscription'

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      fieldName
      AddIntegrationProviderSuccess {
        ...AddIntegrationProviderMutation_organization @relay(mask: false)
      }
      ArchiveOrganizationPayload {
        ...ArchiveOrganizationMutation_organization @relay(mask: false)
      }
      UpdateOrgPayload {
        ...UpdateOrgMutation_organization @relay(mask: false)
      }
      UpgradeToTeamTierSuccess {
        ...UpgradeToTeamTierFrag_organization @relay(mask: false)
      }
      RemoveIntegrationProviderSuccess {
        ...RemoveIntegrationProviderMutation_organization @relay(mask: false)
      }
      RemoveOrgUsersSuccess {
        ...RemoveOrgUsersMutation_organization @relay(mask: false)
      }
      SetOrgUserRoleSuccess {
        ...SetOrgUserRoleMutation_organization @relay(mask: false)
      }
      UpdateIntegrationProviderSuccess {
        ...UpdateIntegrationProviderMutation_organization @relay(mask: false)
      }
      UpdateTemplateScopeSuccess {
        ...UpdateReflectTemplateScopeMutation_organization @relay(mask: false)
      }
    }
  }
`

const onNextHandlers = {
  ArchiveOrganizationPayload: archiveOrganizationOrganizationOnNext,
  RemoveOrgUsersSuccess: removeOrgUsersOrganizationOnNext,
  SetOrgUserRoleSuccess: setOrgUserRoleAddedOrganizationOnNext
} as const

const updateHandlers = {
  ArchiveOrganizationPayload: archiveOrganizationOrganizationUpdater,
  RemoveOrgUsersSuccess: removeOrgUsersOrganizationUpdater,
  SetOrgUserRoleSuccess: setOrgUserRoleAddedOrganizationUpdater,
  UpdateTemplateScopeSuccess: updateTemplateScopeOrganizationUpdater
} as const

export default createSubscription(subscription, onNextHandlers, updateHandlers)
