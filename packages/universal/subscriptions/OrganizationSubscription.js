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

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
      ...AddOrgMutation_organization @relay(mask: false)
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

const OrganizationSubscription = (atmosphere, queryVariables, subParams) => {
  const {viewerId} = atmosphere
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      switch (type) {
        case 'AddOrgPayload':
          addOrgMutationOrganizationUpdater(payload, store, viewerId)
          break
        case 'SetOrgUserRoleAddedPayload':
          setOrgUserRoleAddedOrganizationUpdater(payload, store, viewerId)
          break
        case 'SetOrgUserRoleRemovedPayload':
          setOrgUserRoleRemovedOrganizationUpdater(payload, store, viewerId)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserOrganizationUpdater(payload, store, viewerId)
          break
        case 'UpdateCreditCardPayload':
          break
        case 'UpdateOrgPayload':
          break
        default:
          console.error('OrganizationSubscription case fail', type)
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
