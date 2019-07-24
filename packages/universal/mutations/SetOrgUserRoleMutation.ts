import {commitMutation, graphql} from 'react-relay'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleAddOrganization from './handlers/handleAddOrganization'
import handleRemoveNotifications from './handlers/handleRemoveNotifications'
import getInProxy from '../utils/relay/getInProxy'
import {OnNextHandler} from '../types/relayMutations'
import {SetOrgUserRoleMutationAdded_organization} from '../../__generated__/SetOrgUserRoleMutationAdded_organization.graphql'

graphql`
  fragment SetOrgUserRoleMutationAdded_organization on SetOrgUserRoleAddedPayload {
    organization {
      ...CompleteOrganizationFrag @relay(mask: false)
    }
    notificationsAdded {
      type
      ...PromoteToBillingLeader_notification @relay(mask: false)
      ...PaymentRejected_notification @relay(mask: false)
    }
    updatedOrgMember {
      user {
        id
      }
      role
    }
  }
`

graphql`
  fragment SetOrgUserRoleMutationRemoved_organization on SetOrgUserRoleRemovedPayload {
    organization {
      id
      isBillingLeader
    }
    notificationsRemoved {
      id
    }
    updatedOrgMember {
      user {
        id
      }
      role
    }
  }
`

const mutation = graphql`
  mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: String) {
    setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
      error {
        message
      }
      ...SetOrgUserRoleMutationAdded_organization @relay(mask: false)
      ...SetOrgUserRoleMutationRemoved_organization @relay(mask: false)
    }
  }
`

export const setOrgUserRoleAddedOrganizationOnNext: OnNextHandler<
  SetOrgUserRoleMutationAdded_organization
> = (payload, {atmosphere, history}) => {
  if (!payload || !payload.organization) return
  const {id: orgId, name: orgName} = payload.organization
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `promotedToBillingLead:${orgId}`,
    autoDismiss: 10,
    message: `Congratulations! You’ve been promoted to billing leader for ${orgName}`,
    action: {
      label: 'Check it out!',
      callback: () => {
        history && history.push(`/me/organizations/${orgId}/members`)
      }
    }
  })
}

export const setOrgUserRoleAddedOrganizationUpdater = (payload, store, viewerId) => {
  const promotedUserId = getInProxy(payload, 'updatedOrgMember', 'user', 'id')
  if (promotedUserId === viewerId) {
    const notificationsAdded = payload.getLinkedRecords('notificationsAdded')
    handleAddNotifications(notificationsAdded, store)

    const org = payload.getLinkedRecord('organization')
    handleAddOrganization(org, store, viewerId)
  }
}

export const setOrgUserRoleRemovedOrganizationUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'updatedOrgMember', 'user', 'id')
  if (removedUserId === viewerId) {
    const notificationsRemoved = payload.getLinkedRecords('notificationsRemoved')
    const notificationIdsRemoved = getInProxy(notificationsRemoved, 'id')
    handleRemoveNotifications(notificationIdsRemoved, store)
    // const orgId = getInProxy(payload, 'organization', 'id');
    // handleRemoveOrganization(orgId, store, viewerId);
  }
}

const SetOrgUserRoleMutation = (environment, variables, _options, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default SetOrgUserRoleMutation
