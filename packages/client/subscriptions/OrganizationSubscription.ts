import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription} from 'relay-runtime'
import {
  archiveOrganizationOrganizationOnNext,
  archiveOrganizationOrganizationUpdater
} from '~/mutations/ArchiveOrganizationMutation'
import {
  OrganizationSubscription as TOrganizationSubscription,
  OrganizationSubscription$variables
} from '~/__generated__/OrganizationSubscription.graphql'
import Atmosphere from '../Atmosphere'
import {addOrgMutationOrganizationUpdater} from '../mutations/AddOrgMutation'
import {
  removeOrgUserOrganizationOnNext,
  removeOrgUserOrganizationUpdater
} from '../mutations/RemoveOrgUserMutation'
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
      AddOrgPayload {
        ...AddOrgMutation_organization @relay(mask: false)
      }
      ArchiveOrganizationPayload {
        ...ArchiveOrganizationMutation_organization @relay(mask: false)
      }
      PayLaterPayload {
        ...PayLaterMutation_organization @relay(mask: false)
      }
      SetOrgUserRoleAddedPayload {
        ...SetOrgUserRoleMutationAdded_organization @relay(mask: false)
      }
      SetOrgUserRoleRemovedPayload {
        ...SetOrgUserRoleMutationRemoved_organization @relay(mask: false)
      }
      UpdateCreditCardPayload {
        ...UpdateCreditCardMutation_organization @relay(mask: false)
      }
      UpdateOrgPayload {
        ...UpdateOrgMutation_organization @relay(mask: false)
      }
      UpgradeToTeamTierPayload {
        ...UpgradeToTeamTierMutation_organization @relay(mask: false)
      }
      RemoveOrgUserPayload {
        ...RemoveOrgUserMutation_organization @relay(mask: false)
      }
      UpdateTemplateScopeSuccess {
        ...UpdateReflectTemplateScopeMutation_organization @relay(mask: false)
      }
    }
  }
`

const onNextHandlers = {
  ArchiveOrganizationPayload: archiveOrganizationOrganizationOnNext,
  RemoveOrgUserPayload: removeOrgUserOrganizationOnNext,
  SetOrgUserRoleAddedPayload: setOrgUserRoleAddedOrganizationOnNext
} as const

const updateHandlers = {
  AddOrgPayload: addOrgMutationOrganizationUpdater,
  ArchiveOrganizationPayload: archiveOrganizationOrganizationUpdater,
  SetOrgUserRoleAddedPayload: setOrgUserRoleAddedOrganizationUpdater,
  RemoveOrgUserPayload: removeOrgUserOrganizationUpdater,
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
