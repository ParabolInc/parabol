import {addOrgMutationOrganizationUpdater} from '../mutations/AddOrgMutation'
import {
  setOrgUserRoleAddedOrganizationOnNext,
  setOrgUserRoleAddedOrganizationUpdater
} from '../mutations/SetOrgUserRoleMutation'
import {
  removeOrgUserOrganizationOnNext,
  removeOrgUserOrganizationUpdater
} from '../mutations/RemoveOrgUserMutation'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import {requestSubscription, Variables} from 'relay-runtime'
import {OrganizationSubscriptionResponse} from '__generated__/OrganizationSubscription.graphql'
import {RouterProps} from 'react-router'

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
      ...AddOrgMutation_organization @relay(mask: false)
      ...PayLaterMutation_organization @relay(mask: false)
      ...SetOrgUserRoleMutationAdded_organization @relay(mask: false)
      ...SetOrgUserRoleMutationRemoved_organization @relay(mask: false)
      ...UpdateCreditCardMutation_organization @relay(mask: false)
      ...UpdateOrgMutation_organization @relay(mask: false)
      ...UpgradeToProMutation_organization @relay(mask: false)
      ...RemoveOrgUserMutation_organization @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  RemoveOrgUserPayload: removeOrgUserOrganizationOnNext,
  SetOrgUserRoleAddedPayload: setOrgUserRoleAddedOrganizationOnNext
}

const updateHandlers = {
  AddOrgPayload: addOrgMutationOrganizationUpdater,
  SetOrgUserRoleAddedPayload: setOrgUserRoleAddedOrganizationUpdater,
  RemoveOrgUserPayload: removeOrgUserOrganizationUpdater
}

const OrganizationSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: RouterProps['history']}
) => {
  const {viewerId} = atmosphere
  return requestSubscription<OrganizationSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename') as string
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload, store, viewerId)
      }
    },
    onNext: (result) => {
      if (!result) return
      const {organizationSubscription} = result
      const {__typename: type} = organizationSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(organizationSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(OrganizationSubscription.name, variables)
    }
  })
}

export default OrganizationSubscription
