import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SetOrgUserRoleMutation as TSetOrgUserRoleMutation} from '../__generated__/SetOrgUserRoleMutation.graphql'
import {SetOrgUserRoleMutation_organization$data} from '../__generated__/SetOrgUserRoleMutation_organization.graphql'
import {
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleAddOrganization from './handlers/handleAddOrganization'

graphql`
  fragment SetOrgUserRoleMutation_organization on SetOrgUserRoleSuccess {
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

const mutation = graphql`
  mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: OrgUserRole) {
    setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetOrgUserRoleMutation_organization @relay(mask: false)
    }
  }
`

export const setOrgUserRoleAddedOrganizationOnNext: OnNextHandler<
  SetOrgUserRoleMutation_organization$data,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  if (!payload || !payload.organization || !payload.notificationsAdded?.length) return
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
  SetOrgUserRoleMutation_organization$data
> = (payload, {atmosphere, store}) => {
  const {viewerId} = atmosphere
  const notificationsAdded = payload.getLinkedRecords('notificationsAdded')
  const notificationsExist = notificationsAdded.some((notification) =>
    notification.getValue('type')
  )
  if (!notificationsExist) return
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
