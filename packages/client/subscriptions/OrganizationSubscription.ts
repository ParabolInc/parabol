import {addOrgMutationOrganizationUpdater} from '../mutations/AddOrgMutation'
import {
  setOrgUserRoleAddedOrganizationOnNext,
  setOrgUserRoleAddedOrganizationUpdater,
  setOrgUserRoleRemovedOrganizationUpdater
} from '../mutations/SetOrgUserRoleMutation'
import {
  removeOrgUserOrganizationOnNext,
  removeOrgUserOrganizationUpdater
} from '../mutations/RemoveOrgUserMutation'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import {Variables} from 'relay-runtime'

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
  SetOrgUserRoleRemovedPayload: setOrgUserRoleRemovedOrganizationUpdater,
  RemoveOrgUserPayload: removeOrgUserOrganizationUpdater
}

const OrganizationSubscription = (
  atmosphere: Atmosphere,
  _queryVariables: Variables,
  subParams: Variables
) => {
  const {viewerId} = atmosphere
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload, store, viewerId)
      }
    },
    onNext: ({organizationSubscription}) => {
      const {__typename: type} = organizationSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(organizationSubscription, {...subParams, atmosphere})
      }
    }
  }
}

export default OrganizationSubscription
