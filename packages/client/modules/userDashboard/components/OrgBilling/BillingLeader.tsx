import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {BillingLeader_organization$key} from '../../../../__generated__/BillingLeader_organization.graphql'
import type {BillingLeader_orgUser$key} from '../../../../__generated__/BillingLeader_orgUser.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import Row from '../../../../components/Row/Row'
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import BaseTag from '../../../../components/Tag/BaseTag'
import {cn} from '../../../../ui/cn'
import lazyPreload from '../../../../utils/lazyPreload'
import LeaveOrgModal from '../LeaveOrgModal/LeaveOrgModal'
import RemoveFromOrgModal from '../RemoveFromOrgModal/RemoveFromOrgModal'

const OrgAdminActionMenu = lazyPreload(
  () =>
    import(/* webpackChunkName: 'OrgAdminActionMenu' */ '../../../../components/OrgAdminActionMenu')
)

type Props = {
  billingLeaderRef: BillingLeader_orgUser$key
  isFirstRow: boolean
  billingLeaderCount: number
  organizationRef: BillingLeader_organization$key
}

const BillingLeader = (props: Props) => {
  const {billingLeaderRef, isFirstRow, organizationRef} = props
  const billingLeader = useFragment(
    graphql`
      fragment BillingLeader_orgUser on OrganizationUser {
        ...OrgAdminActionMenu_organizationUser
        ...RemoveFromOrgModal_organizationUsers
        role
        user {
          id
          preferredName
          picture
        }
      }
    `,
    billingLeaderRef
  )
  const organization = useFragment(
    graphql`
      fragment BillingLeader_organization on Organization {
        ...OrgAdminActionMenu_organization
        id
        isOrgAdmin
        isBillingLeader
      }
    `,
    organizationRef
  )
  const {
    id: orgId,
    isOrgAdmin: isViewerOrgAdmin,
    isBillingLeader: isViewerBillingLeader
  } = organization
  const [isLeaveOpen, setIsLeaveOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const {user: billingLeaderUser, role} = billingLeader
  const {id: userId, preferredName, picture} = billingLeaderUser
  const canEdit = isViewerOrgAdmin || (isViewerBillingLeader && role === 'BILLING_LEADER')
  return (
    <Row className={cn('flex items-center px-4 py-3', isFirstRow && 'border-none')}>
      <Avatar picture={picture} className='h-11 w-11' />
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{preferredName}</RowInfoHeading>
        </RowInfoHeader>
      </RowInfo>
      {billingLeader.role === 'ORG_ADMIN' && (
        <BaseTag className='bg-gold-500 text-white'>Org Admin</BaseTag>
      )}
      <RowActions>
        <div className='flex items-center justify-end'>
          {canEdit && (
            <OrgAdminActionMenu
              organization={organization}
              organizationUser={billingLeader}
              toggleLeave={() => setIsLeaveOpen(true)}
              toggleRemove={() => setIsRemoveOpen(true)}
            />
          )}
        </div>
      </RowActions>
      <LeaveOrgModal isOpen={isLeaveOpen} orgId={orgId} closePortal={() => setIsLeaveOpen(false)} />
      <RemoveFromOrgModal
        isOpen={isRemoveOpen}
        orgId={orgId}
        userIds={[userId]}
        organizationUsers={[billingLeader]}
        closePortal={() => setIsRemoveOpen(false)}
      />
    </Row>
  )
}

export default BillingLeader
