import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {BillingLeader_orgUser$key} from '../../../../__generated__/BillingLeader_orgUser.graphql'
import {BillingLeader_organization$key} from '../../../../__generated__/BillingLeader_organization.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import BillingLeaderMenu from '../../../../components/BillingLeaderMenu'
import FlatButton from '../../../../components/FlatButton'
import IconLabel from '../../../../components/IconLabel'
import Row from '../../../../components/Row/Row'
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import BaseTag from '../../../../components/Tag/BaseTag'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useModal from '../../../../hooks/useModal'
import useTooltip from '../../../../hooks/useTooltip'
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

const MenuToggleBlock = styled('div')({
  width: 32
})

const StyledButton = styled(FlatButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const BillingLeaderActionMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'BillingLeaderActionMenu' */ '../../../../components/BillingLeaderActionMenu'
    )
)

type Props = {
  billingLeaderRef: BillingLeader_orgUser$key
  isFirstRow: boolean
  billingLeaderCount: number
  organizationRef: BillingLeader_organization$key
}

const BillingLeader = (props: Props) => {
  const {billingLeaderRef, isFirstRow, billingLeaderCount, organizationRef} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const billingLeader = useFragment(
    graphql`
      fragment BillingLeader_orgUser on OrganizationUser {
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
        id
        isViewerBillingLeader: isBillingLeader
      }
    `,
    organizationRef
  )
  const {id: orgId, isViewerBillingLeader} = organization
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)
  const {togglePortal: toggleLeave, modalPortal: leaveModal} = useModal()
  const {togglePortal: toggleRemove, modalPortal: removeModal} = useModal()
  const {user: billingLeaderUser} = billingLeader
  const {id: userId, preferredName, picture} = billingLeaderUser
  const isViewerLastBillingLeader = isViewerBillingLeader && billingLeaderCount === 1
  const canViewMenu = !isViewerLastBillingLeader && billingLeader.role !== 'ORG_ADMIN'

  const handleClick = () => {
    togglePortal()
    closeTooltip()
  }

  const handleMouseOver = () => {
    if (!canViewMenu) {
      openTooltip()
    }
  }

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
          <MenuToggleBlock>
            {isViewerBillingLeader && (
              <MenuToggleBlock ref={tooltipRef}>
                <StyledButton
                  onClick={handleClick}
                  onMouseEnter={BillingLeaderActionMenu.preload}
                  onMouseOver={handleMouseOver}
                  onMouseLeave={closeTooltip}
                  ref={originRef}
                  disabled={!canViewMenu}
                >
                  <IconLabel icon='more_vert' />
                </StyledButton>
                {tooltipPortal(
                  isViewerLastBillingLeader ? (
                    <div>
                      {'You need to promote another Billing Leader'}
                      <br />
                      {'before you can remove this role.'}
                    </div>
                  ) : (
                    <div>Contact support (love@parabol.co) to remove the Org Admin role</div>
                  )
                )}
              </MenuToggleBlock>
            )}
            {menuPortal(
              <BillingLeaderMenu
                toggleLeave={toggleLeave}
                menuProps={menuProps}
                userId={userId}
                toggleRemove={toggleRemove}
                orgId={orgId}
              />
            )}
          </MenuToggleBlock>
        </ActionsBlock>
      </RowActions>
      {leaveModal(<LeaveOrgModal orgId={orgId} />)}
      {removeModal(
        <RemoveFromOrgModal orgId={orgId} userId={userId} preferredName={preferredName} />
      )}
    </StyledRow>
  )
}

export default BillingLeader
