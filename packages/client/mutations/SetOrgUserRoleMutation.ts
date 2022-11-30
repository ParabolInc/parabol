import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {SetOrgUserRoleMutation as TSetOrgUserRoleMutation} from '../__generated__/SetOrgUserRoleMutation.graphql'
import {SetOrgUserRoleMutationAdded_organization} from '../__generated__/SetOrgUserRoleMutationAdded_organization.graphql'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleAddOrganization from './handlers/handleAddOrganization'

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
  SetOrgUserRoleMutationAdded_organization,
  OnNextHistoryContext
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

export const setOrgUserRoleAddedOrganizationUpdater: SharedUpdater<
  SetOrgUserRoleMutationAdded_organization
> = (payload, {atmosphere, store}) => {
  const {viewerId} = atmosphere
  const promotedUserId = payload
    .getLinkedRecord('updatedOrgMember')
    .getLinkedRecord('user')
    .getValue('id')
  if (promotedUserId === viewerId) {
    const notificationsAdded = payload.getLinkedRecords('notificationsAdded')
    handleAddNotifications(notificationsAdded as any, store)

    const org = payload.getLinkedRecord('organization')
    handleAddOrganization(org, store)
  }
}

const SetOrgUserRoleMutation: StandardMutation<TSetOrgUserRoleMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetOrgUserRoleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default SetOrgUserRoleMutation
