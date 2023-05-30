import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import Avatar from '../../../../components/Avatar/Avatar'
import React from 'react'
import {BillingLeader_user$key} from '../../../../__generated__/BillingLeader_user.graphql'
import {BillingLeader_organization$key} from '../../../../__generated__/BillingLeader_organization.graphql'
import Row from '../../../../components/Row/Row'
import {ElementWidth} from '../../../../types/constEnums'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowActions from '../../../../components/Row/RowActions'
import FlatButton from '../../../../components/FlatButton'
import RowInfo from '../../../../components/Row/RowInfo'
import {useFragment} from 'react-relay'
import IconLabel from '../../../../components/IconLabel'
import lazyPreload from '../../../../utils/lazyPreload'
import useMenu from '../../../../hooks/useMenu'
import BillingLeaderMenu from '../../../../components/BillingLeaderMenu'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import LeaveOrgModal from '../LeaveOrgModal/LeaveOrgModal'
import useModal from '../../../../hooks/useModal'
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
  billingLeaderRef: BillingLeader_user$key
  isFirstRow: boolean
  billingLeaderCount: number
  organizationRef: BillingLeader_organization$key
}

const BillingLeader = (props: Props) => {
  const {billingLeaderRef, isFirstRow, billingLeaderCount, organizationRef} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const billingLeader = useFragment(
    graphql`
      fragment BillingLeader_user on User {
        id
        preferredName
        picture
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
  const {id: userId, preferredName, picture} = billingLeader
  const isViewerLastBillingLeader = isViewerBillingLeader && billingLeaderCount === 1

  const handleClick = () => {
    togglePortal()
    closeTooltip()
  }

  const handleMouseOver = () => {
    if (isViewerLastBillingLeader) {
      openTooltip()
    }
  }

  return (
    <StyledRow isFirstRow={isFirstRow}>
      <Avatar hasBadge={false} picture={picture} size={ElementWidth.BILLING_AVATAR} />
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{preferredName}</RowInfoHeading>
        </RowInfoHeader>
      </RowInfo>
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
                  disabled={isViewerLastBillingLeader}
                >
                  <IconLabel icon='more_vert' />
                </StyledButton>
                {tooltipPortal(
                  <div>
                    {'You need to promote another Billing Leader'}
                    <br />
                    {'before you can remove this role.'}
                  </div>
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
