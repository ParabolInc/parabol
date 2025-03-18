import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription} from 'relay-runtime'
import {
  OrganizationSubscription$variables,
  OrganizationSubscription as TOrganizationSubscription
} from '~/__generated__/OrganizationSubscription.graphql'
import {
  archiveOrganizationOrganizationOnNext,
  archiveOrganizationOrganizationUpdater
} from '~/mutations/ArchiveOrganizationMutation'
import Atmosphere from '../Atmosphere'
import {addOrgMutationOrganizationUpdater} from '../mutations/AddOrgMutation'
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

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      fieldName
      AddIntegrationProviderSuccess {
        ...AddIntegrationProviderMutation_organization @relay(mask: false)
      }
      AddOrgPayload {
        ...AddOrgMutation_organization @relay(mask: false)
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
  AddOrgPayload: addOrgMutationOrganizationUpdater,
  ArchiveOrganizationPayload: archiveOrganizationOrganizationUpdater,
  RemoveOrgUsersSuccess: removeOrgUsersOrganizationUpdater,
  SetOrgUserRoleSuccess: setOrgUserRoleAddedOrganizationUpdater,
  UpdateTemplateScopeSuccess: updateTemplateScopeOrganizationUpdater
} as const

const OrganizationSubscription = (
  atmosphere: Atmosphere,
  variables: OrganizationSubscription$variables,
  router: {history: RouterProps['history']}
) => {
  atmosphere.registerSubscription(subscription)
  return requestSubscription<TOrganizationSubscription>(atmosphere, {
    subscription,
    variables,
    updater: subscriptionUpdater('organizationSubscription', updateHandlers, atmosphere),
    onNext: subscriptionOnNext('organizationSubscription', onNextHandlers, atmosphere, router),
    onCompleted: () => {
      atmosphere.unregisterSub(OrganizationSubscription.name, variables)
    }
  })
}
OrganizationSubscription.key = 'organization'
export default OrganizationSubscription
