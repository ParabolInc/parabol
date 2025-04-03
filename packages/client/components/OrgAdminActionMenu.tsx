import {MoreVert} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {OrgAdminActionMenu_organization$key} from '../__generated__/OrgAdminActionMenu_organization.graphql'
import {OrgAdminActionMenu_organizationUser$key} from '../__generated__/OrgAdminActionMenu_organizationUser.graphql'
import useMutationProps from '../hooks/useMutationProps'
import SetOrgUserRoleMutation from '../mutations/SetOrgUserRoleMutation'
import {Button} from '../ui/Button/Button'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'

interface Props {
  organizationUser: OrgAdminActionMenu_organizationUser$key
  organization: OrgAdminActionMenu_organization$key
  toggleLeave: () => void
  toggleRemove: () => void
}

export const OrgAdminActionMenu = (props: Props) => {
  const {
    organizationUser: organizationUserRef,
    organization: organizationRef,
    toggleLeave,
    toggleRemove
  } = props
  const organization = useFragment(
    graphql`
      fragment OrgAdminActionMenu_organization on Organization {
        id
        isBillingLeader
        isOrgAdmin
        billingLeaders {
          id
          role
        }
      }
    `,
    organizationRef
  )
  const organizationUser = useFragment(
    graphql`
      fragment OrgAdminActionMenu_organizationUser on OrganizationUser {
        role
        user {
          id
        }
      }
    `,
    organizationUserRef
  )
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const {
    id: orgId,
    isBillingLeader: isViewerBillingLeaderPlus,
    isOrgAdmin: isViewerOrgAdmin,
    billingLeaders
  } = organization
  const {viewerId} = atmosphere
  const {role, user} = organizationUser
  const {id: userId} = user
  const isSelf = viewerId === userId
  const orgAdminCount = billingLeaders.filter(
    (billingLeader) => billingLeader.role === 'ORG_ADMIN'
  ).length
  const canEdit = isSelf || isViewerOrgAdmin || (isViewerBillingLeaderPlus && role !== 'ORG_ADMIN')
  const isViewerLastOrgAdmin = isViewerOrgAdmin && orgAdminCount === 1
  const isViewerLastRole = isViewerBillingLeaderPlus && billingLeaders.length === 1

  const setRole =
    (role: 'ORG_ADMIN' | 'BILLING_LEADER' | null = null) =>
    () => {
      if (submitting) return
      submitMutation()
      const variables = {orgId, userId, role}
      SetOrgUserRoleMutation(atmosphere, variables, {onError, onCompleted})
    }

  const isOrgAdmin = role === 'ORG_ADMIN'
  const isBillingLeader = role === 'BILLING_LEADER'
  const roleName = role === 'ORG_ADMIN' ? 'Org Admin' : 'Billing Leader'
  const canRemoveRole =
    role &&
    ((isViewerOrgAdmin && (!isSelf || !isViewerLastOrgAdmin)) ||
      (isViewerBillingLeaderPlus && isBillingLeader && (!isSelf || !isViewerLastRole)))
  return (
    <Menu
      trigger={
        canEdit && (
          <Button variant='flat' className='h-7 w-7'>
            <MoreVert className='text-lg' />
          </Button>
        )
      }
    >
      <MenuContent align='end' sideOffset={4}>
        {isViewerOrgAdmin && !isOrgAdmin && (
          <MenuItem onClick={setRole('ORG_ADMIN')}>{'Promote to Org Admin'}</MenuItem>
        )}
        {isViewerBillingLeaderPlus && !isOrgAdmin && !isBillingLeader && (
          <MenuItem onClick={setRole('BILLING_LEADER')}>{'Promote to Billing Leader'}</MenuItem>
        )}
        {isViewerOrgAdmin && isOrgAdmin && (!isSelf || !isViewerLastOrgAdmin) && (
          <MenuItem onClick={setRole('BILLING_LEADER')}>{'Change to Billing Leader'}</MenuItem>
        )}
        {canRemoveRole && <MenuItem onClick={setRole(null)}>{`Remove ${roleName} role`}</MenuItem>}
        {isSelf &&
          ((isOrgAdmin && !isViewerLastOrgAdmin) ||
            (isBillingLeader && !isViewerLastRole) ||
            !isViewerBillingLeaderPlus) && (
            <MenuItem onClick={toggleLeave}>{'Leave Organization'}</MenuItem>
          )}
        {!isSelf && (isViewerOrgAdmin || (isViewerBillingLeaderPlus && !isOrgAdmin)) && (
          <MenuItem onClick={toggleRemove}>{'Remove from Organization'}</MenuItem>
        )}
        {isSelf &&
          ((isOrgAdmin && isViewerLastOrgAdmin) || (isBillingLeader && isViewerLastRole)) && (
            <MenuItem
              onClick={() => {
                window.location.href =
                  'mailto:support@parabol.co?subject=Request to be removed from organization'
              }}
            >
              {'Contact support@parabol.co to be removed'}
            </MenuItem>
          )}
      </MenuContent>
    </Menu>
  )
}

export default OrgAdminActionMenu
