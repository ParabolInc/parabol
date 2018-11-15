import {addOrgMutationOrganizationUpdater} from 'universal/mutations/AddOrgMutation'
import {approveToOrgOrganizationUpdater} from 'universal/mutations/ApproveToOrgMutation'
import {
  setOrgUserRoleAddedOrganizationUpdater,
  setOrgUserRoleRemovedOrganizationUpdater
} from 'universal/mutations/SetOrgUserRoleMutation'
import {
  removeOrgUserOrganizationOnNext,
  removeOrgUserOrganizationUpdater
} from 'universal/mutations/RemoveOrgUserMutation'

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
      ...AddOrgMutation_organization @relay(mask: false)
      ...ApproveToOrgMutation_organization @relay(mask: false)
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
  RemoveOrgUserPayload: removeOrgUserOrganizationOnNext
}

const OrganizationSubscription = (atmosphere, queryVariables, subParams) => {
  const {dispatch, history} = subParams
  const {viewerId} = atmosphere
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      const options = {dispatch, history}
      switch (type) {
        case 'AddOrgPayload':
          addOrgMutationOrganizationUpdater(payload, store, viewerId)
          break
        case 'ApproveToOrgPayload':
          approveToOrgOrganizationUpdater(payload, store, viewerId)
          break
        case 'SetOrgUserRoleAddedPayload':
          setOrgUserRoleAddedOrganizationUpdater(payload, store, viewerId, options)
          break
        case 'SetOrgUserRoleRemovedPayload':
          setOrgUserRoleRemovedOrganizationUpdater(payload, store, viewerId)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserOrganizationUpdater(payload, store, viewerId)
          break
        case 'UpdateCreditCardPayload':
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
