import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {BillingLeader_orgUser$key} from '../../../../__generated__/BillingLeader_orgUser.graphql'
import {BillingLeader_organization$key} from '../../../../__generated__/BillingLeader_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import Row from '../../../../components/Row/Row'
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import BaseTag from '../../../../components/Tag/BaseTag'
import useModal from '../../../../hooks/useModal'
import lazyPreload from '../../../../utils/lazyPreload'
import LeaveOrgModal from '../LeaveOrgModal/LeaveOrgModal'
import RemoveFromOrgModal from '../RemoveFromOrgModal/RemoveFromOrgModal'

const StyledRow = styled(Row)<{isFirstRow: boolean}>(({isFirstRow}) => ({
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  border: isFirstRow ? 'none' : undefined
}))

const ActionsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

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
  const {
    togglePortal: toggleLeave,
    modalPortal: leaveModal,
    closePortal: closeLeaveModal
  } = useModal()
  const {
    togglePortal: toggleRemove,
    modalPortal: removeModal,
    closePortal: closeRemoveModal
  } = useModal()
  const {user: billingLeaderUser, role} = billingLeader
  const {id: userId, preferredName, picture} = billingLeaderUser
  const canEdit = isViewerOrgAdmin || (isViewerBillingLeader && role === 'BILLING_LEADER')
  return (
    <StyledRow isFirstRow={isFirstRow}>
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
        <ActionsBlock>
          {canEdit && (
            <OrgAdminActionMenu
              organization={organization}
              organizationUser={billingLeader}
              toggleLeave={toggleLeave}
              toggleRemove={toggleRemove}
            />
          )}
        </ActionsBlock>
      </RowActions>
      {leaveModal(<LeaveOrgModal orgId={orgId} closePortal={closeLeaveModal} />)}
      {removeModal(
        <RemoveFromOrgModal
          orgId={orgId}
          userIds={[userId]}
          organizationUsers={[billingLeader]}
          closePortal={closeRemoveModal}
        />
      )}
    </StyledRow>
  )
}

export default BillingLeader
