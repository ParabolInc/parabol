import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription} from 'relay-runtime'
import {
  archiveOrganizationOrganizationOnNext,
  archiveOrganizationOrganizationUpdater
} from '~/mutations/ArchiveOrganizationMutation'
import {
  OrganizationSubscription as TOrganizationSubscription,
  OrganizationSubscriptionVariables
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

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
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
  variables: OrganizationSubscriptionVariables,
  router: {history: RouterProps['history']}
) => {
  return requestSubscription<TOrganizationSubscription>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename') as keyof typeof updateHandlers
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload[type], {atmosphere, store})
      }
    },
    onNext: (result) => {
      if (!result) return
      const {organizationSubscription} = result
      const type = organizationSubscription.__typename as keyof typeof organizationSubscription
      const handler = onNextHandlers[type as keyof typeof onNextHandlers]
      if (handler) {
        handler(organizationSubscription[type] as any, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(OrganizationSubscription.name, variables)
    }
  })
}
OrganizationSubscription.key = 'organization'
export default OrganizationSubscription
