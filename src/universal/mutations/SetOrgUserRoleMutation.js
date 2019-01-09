import {commitMutation} from 'react-relay'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import getInProxy from 'universal/utils/relay/getInProxy'

graphql`
  fragment SetOrgUserRoleMutationAdded_organization on SetOrgUserRoleAddedPayload {
    organization {
      ...CompleteOrganizationFrag @relay(mask: false)
    }
    notificationsAdded {
      type
      ...PromoteToBillingLeader_notification @relay(mask: false)
      ...PaymentRejected_notification @relay(mask: false)
      ...RequestNewUser_notification @relay(mask: false)
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

const popPromoteToBillingLeaderToast = (payload, {atmosphere, history}) => {
  if (!payload || !payload.organization) return
  const {id: orgId, name: orgName} = payload.organization
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'Congratulations!',
    message: `You’ve been promoted to billing leader for ${orgName}`,
    action: {
      label: 'Check it out!',
      callback: () => {
        history.push(`/me/organizations/${orgId}/members`)
      }
    }
  })
}

export const setOrgUserRoleAddedOrganizationOnNext = (payload, {atmosphere, history}) => {
  popPromoteToBillingLeaderToast(payload, {atmosphere, history})
}

export const setOrgUserRoleAddedOrganizationUpdater = (payload, store, viewerId) => {
  const promotedUserId = getInProxy(payload, 'updatedOrgMember', 'user', 'id')
  if (promotedUserId === viewerId) {
    const notificationsAdded = payload.getLinkedRecords('notificationsAdded')
    handleAddNotifications(notificationsAdded, store, viewerId)

    const org = payload.getLinkedRecord('organization')
    handleAddOrganization(org, store, viewerId)
  }
}

export const setOrgUserRoleRemovedOrganizationUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'updatedOrgMember', 'user', 'id')
  if (removedUserId === viewerId) {
    const notificationsRemoved = payload.getLinkedRecords('notificationsRemoved')
    const notificationIdsRemoved = getInProxy(notificationsRemoved, 'id')
    handleRemoveNotifications(notificationIdsRemoved, store, viewerId)
    // const orgId = getInProxy(payload, 'organization', 'id');
    // handleRemoveOrganization(orgId, store, viewerId);
  }
}

const SetOrgUserRoleMutation = (environment, variables, options, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default SetOrgUserRoleMutation
