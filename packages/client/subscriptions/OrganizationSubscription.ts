import graphql from 'babel-plugin-relay/macro'
import type {RouterProps} from 'react-router'
import {requestSubscription} from 'relay-runtime'
import type {
  OrganizationSubscription$variables,
  OrganizationSubscription as TOrganizationSubscription
} from '~/__generated__/OrganizationSubscription.graphql'
import {
  archiveOrganizationOrganizationOnNext,
  archiveOrganizationOrganizationUpdater
} from '~/mutations/ArchiveOrganizationMutation'
import type Atmosphere from '../Atmosphere'
import {
  removeOrgUsersOrganizationOnNext,
  removeOrgUsersOrganizationUpdater
} from '../mutations/RemoveOrgUsersMutation'
import {
  setOrgUserRoleAddedOrganizationOnNext,
  setOrgUserRoleAddedOrganizationUpdater
} from '../mutations/SetOrgUserRoleMutation'
import {updateTemplateScopeOrganizationUpdater} from '../mutations/UpdateReflectTemplateScopeMutation'
import subscriptionOnNext from './subscriptionOnNext'
import subscriptionUpdater from './subscriptionUpdater'
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
