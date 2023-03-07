import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef, Ref} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import Avatar from '../../../../components/Avatar/Avatar'
import FlatButton, {FlatButtonProps} from '../../../../components/FlatButton'
import IconLabel from '../../../../components/IconLabel'
import Row from '../../../../components/Row/Row'
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoLink from '../../../../components/Row/RowInfoLink'
import EmphasisTag from '../../../../components/Tag/EmphasisTag'
import InactiveTag from '../../../../components/Tag/InactiveTag'
import RoleTag from '../../../../components/Tag/RoleTag'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useModal from '../../../../hooks/useModal'
import useTooltip from '../../../../hooks/useTooltip'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import {Breakpoint} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import {OrgMemberRow_organization$key} from '../../../../__generated__/OrgMemberRow_organization.graphql'
import {OrgMemberRow_organizationUser$key} from '../../../../__generated__/OrgMemberRow_organizationUser.graphql'

const AvatarBlock = styled('div')({
  display: 'none',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    display: 'block',
    marginRight: 16
  }
})

const StyledRow = styled(Row)({
  padding: '12px 8px 12px 16px',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    padding: '16px 8px 16px 16px'
  }
})

const StyledRowInfo = styled(RowInfo)({
  paddingLeft: 0
})

const ActionsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

const MenuToggleBlock = styled('div')({
  marginLeft: 8,
  width: '2rem'
})

interface Props extends WithMutationProps {
  billingLeaderCount: number
  organizationUser: OrgMemberRow_organizationUser$key
  organization: OrgMemberRow_organization$key
}

const StyledButton = styled(FlatButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledFlatButton = styled(FlatButton)({
  paddingLeft: 16,
  paddingRight: 16
})

const MenuButton = forwardRef((props: FlatButtonProps, ref: Ref<HTMLButtonElement>) => (
  <StyledButton {...props} disabled={props.disabled} ref={ref}>
    <IconLabel icon='more_vert' />
  </StyledButton>
))

const LeaveOrgModal = lazyPreload(
  () => import(/* webpackChunkName: 'LeaveOrgModal' */ '../LeaveOrgModal/LeaveOrgModal')
)

const BillingLeaderActionMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'BillingLeaderActionMenu' */ '../../../../components/BillingLeaderActionMenu'
    )
)

const RemoveFromOrgModal = lazyPreload(
  () =>
    import(/* webpackChunkName: 'RemoveFromOrgModal' */ '../RemoveFromOrgModal/RemoveFromOrgModal')
)

const OrgMemberRow = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {
    billingLeaderCount,
    organizationUser: organizationUserRef,
    organization: organizationRef
  } = props
  const organization = useFragment(
    graphql`
      fragment OrgMemberRow_organization on Organization {
        isViewerBillingLeader: isBillingLeader
        orgId: id
        ...BillingLeaderActionMenu_organization
      }
    `,
    organizationRef
  )
  const organizationUser = useFragment(
    graphql`
      fragment OrgMemberRow_organizationUser on OrganizationUser {
        user {
          userId: id
          email
          inactive
          picture
          preferredName
        }
        role
        newUserUntil
        ...BillingLeaderActionMenu_organizationUser
      }
    `,
    organizationUserRef
  )
  const {orgId, isViewerBillingLeader} = organization
  const {newUserUntil, user, role} = organizationUser
  const isBillingLeader = role === 'BILLING_LEADER'
  const {email, inactive, picture, preferredName, userId} = user
  const isViewerLastBillingLeader =
    isViewerBillingLeader && isBillingLeader && billingLeaderCount === 1
  const {viewerId} = atmosphere
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {togglePortal: toggleLeave, modalPortal: leaveModal} = useModal()
  const {togglePortal: toggleRemove, modalPortal: removeModal} = useModal()
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_RIGHT)

  return (
    <StyledRow>
      <AvatarBlock>
        {picture ? (
          <Avatar hasBadge={false} picture={picture} size={44} />
        ) : (
          <img alt='' src={defaultUserAvatar} />
        )}
      </AvatarBlock>
      <StyledRowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{preferredName}</RowInfoHeading>
          {isBillingLeader && <RoleTag>{'Billing Leader'}</RoleTag>}
          {inactive && !isBillingLeader && <InactiveTag>{'Inactive'}</InactiveTag>}
          {new Date(newUserUntil) > new Date() && <EmphasisTag>{'New'}</EmphasisTag>}
        </RowInfoHeader>
        <RowInfoLink href={`mailto:${email}`} title='Send an email'>
          {email}
        </RowInfoLink>
      </StyledRowInfo>
      <RowActions>
        <ActionsBlock>
          {!isBillingLeader && viewerId === userId && (
            <StyledFlatButton onClick={toggleLeave} onMouseEnter={LeaveOrgModal.preload}>
              Leave Organization
            </StyledFlatButton>
          )}
          {isViewerLastBillingLeader && userId === viewerId && (
            <MenuToggleBlock
              onClick={closeTooltip}
              onMouseOver={openTooltip}
              onMouseOut={closeTooltip}
              ref={tooltipRef}
            >
              {tooltipPortal(
                <div>
                  {'You need to promote another Billing Leader'}
                  <br />
                  {'before you can leave this role or Organization.'}
                </div>
              )}
              <MenuButton disabled />
            </MenuToggleBlock>
          )}
          {isViewerBillingLeader && !(isViewerLastBillingLeader && userId === viewerId) && (
            <MenuToggleBlock>
              <MenuButton
                onClick={togglePortal}
                onMouseEnter={BillingLeaderActionMenu.preload}
                ref={originRef}
              />
            </MenuToggleBlock>
          )}
          {menuPortal(
            <BillingLeaderActionMenu
              menuProps={menuProps}
              isViewerLastBillingLeader={isViewerLastBillingLeader}
              organizationUser={organizationUser}
              organization={organization}
              toggleLeave={toggleLeave}
              toggleRemove={toggleRemove}
            />
          )}
          {leaveModal(<LeaveOrgModal orgId={orgId} />)}
          {removeModal(
            <RemoveFromOrgModal orgId={orgId} userId={userId} preferredName={preferredName} />
          )}
        </ActionsBlock>
      </RowActions>
    </StyledRow>
  )
}

export default withMutationProps(OrgMemberRow)
