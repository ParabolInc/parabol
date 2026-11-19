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
import {updateTemplateScopeOrganizationUpdater} from '../mutations/UpdateTemplateScopeMutation'
import {createSubscription} from './createSubscription'

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      fieldName
      AddIntegrationProviderPayload {
        ...AddIntegrationProviderMutation_organization @relay(mask: false)
      }
      ArchiveOrganizationPayload {
        ...ArchiveOrganizationMutation_organization @relay(mask: false)
      }
      DowngradeToStarterPayload {
        ...DowngradeToStarterMutation_organization @relay(mask: false)
      }
      UpdateOrgPayload {
        ...UpdateOrgMutation_organization @relay(mask: false)
      }
      UpgradeToTeamTierPayload {
        ...UpgradeToTeamTierFrag_organization @relay(mask: false)
      }
      RemoveIntegrationProviderPayload {
        ...RemoveIntegrationProviderMutation_organization @relay(mask: false)
      }
      RemoveOrgUsersPayload {
        ...RemoveOrgUsersMutation_organization @relay(mask: false)
      }
      SetOrgUserRolePayload {
        ...SetOrgUserRoleMutation_organization @relay(mask: false)
      }
      ToggleAIFeaturesPayload {
        ...ToggleAIFeaturesMutation_organization @relay(mask: false)
      }
      UpdateIntegrationProviderPayload {
        ...UpdateIntegrationProviderMutation_organization @relay(mask: false)
      }
      UpdateTemplateScopePayload {
        ...UpdateTemplateScopeMutation_organization @relay(mask: false)
      }
    }
  }
`

const onNextHandlers = {
  ArchiveOrganizationPayload: archiveOrganizationOrganizationOnNext,
  RemoveOrgUsersPayload: removeOrgUsersOrganizationOnNext,
  SetOrgUserRolePayload: setOrgUserRoleAddedOrganizationOnNext
} as const

const updateHandlers = {
  ArchiveOrganizationPayload: archiveOrganizationOrganizationUpdater,
  RemoveOrgUsersPayload: removeOrgUsersOrganizationUpdater,
  SetOrgUserRolePayload: setOrgUserRoleAddedOrganizationUpdater,
  UpdateTemplateScopePayload: updateTemplateScopeOrganizationUpdater
} as const

export default createSubscription(subscription, onNextHandlers, updateHandlers)
