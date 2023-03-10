import styled from '@emotion/styled'
import {Avatar, Divider} from '@mui/material'
import React, {useEffect, useState} from 'react'
import BillingForm from './BillingForm'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {PALETTE} from '../../../../styles/paletteV3'
import {loadStripe} from '@stripe/stripe-js'
import {Elements} from '@stripe/react-stripe-js'
import CreatePaymentIntentMutation from '../../../../mutations/CreatePaymentIntentMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {CreatePaymentIntentMutationResponse} from '../../../../__generated__/CreatePaymentIntentMutation.graphql'
import {CompletedHandler} from '../../../../types/relayMutations'
import {Breakpoint, ElementWidth} from '../../../../types/constEnums'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RoleTag from '../../../../components/Tag/RoleTag'
import RowInfoLink from '../../../../components/Row/RowInfoLink'
import RowActions from '../../../../components/Row/RowActions'
import FlatButton from '../../../../components/FlatButton'
import RowInfo from '../../../../components/Row/RowInfo'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

const StyledRow = styled(Row)({
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'flex-start',
  ':nth-of-type(2)': {
    border: 'none'
  }
})

const Plan = styled('div')({
  lineHeight: '16px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  padding: '0px 16px 16px 16px',
  flexWrap: 'wrap',
  width: '50%',
  overflow: 'hidden'
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 22,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  display: 'flex',
  width: '100%',
  padding: '8px 0px 16px 0px'
})

const Subtitle = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  display: 'flex',
  paddingBottom: 8
})

const Content = styled('div')({
  width: '100%'
})

const InputLabel = styled('span')({
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'left',
  paddingBottom: 4,
  color: PALETTE.SLATE_600,
  textTransform: 'uppercase'
})

const InfoText = styled('span')({
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'left',
  paddingBottom: 8,
  color: PALETTE.SLATE_600,
  textTransform: 'none'
})

const TotalBlock = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 16
})

const ActiveUserBlock = styled('div')({
  paddingTop: 16
})

const AvatarBlock = styled('div')({
  display: 'none',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    display: 'block',
    marginRight: 16
  }
})

// const StyledRow = styled(Row)({
//   padding: '12px 8px 12px 16px',
//   [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
//     padding: '16px 8px 16px 16px'
//   }
// })

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

// interface Props extends WithMutationProps {
//   billingLeaderCount: number
//   organizationUser: OrgMemberRow_organizationUser
//   organization: OrgMemberRow_organization
// }

const StyledButton = styled(FlatButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledFlatButton = styled(FlatButton)({
  paddingLeft: 16,
  paddingRight: 16
})

const stripePromise = loadStripe(window.__ACTION__.stripe)

const BillingLeaders = () => {
  const [clientSecret, setClientSecret] = useState('')
  const atmosphere = useAtmosphere()
  const {onError} = useMutationProps()

  useEffect(() => {
    const handleCompleted: CompletedHandler<CreatePaymentIntentMutationResponse> = (res) => {
      const {createPaymentIntent} = res
      const {clientSecret} = createPaymentIntent
      if (clientSecret) {
        setClientSecret(clientSecret)
      }
    }

    CreatePaymentIntentMutation(atmosphere, {}, {onError, onCompleted: handleCompleted})
  }, [])

  // TODO: add functionality in https://github.com/ParabolInc/parabol/issues/7693
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   // if (submitting) return
  //   // these 3 calls internally call dispatch (or setState), which are asynchronous in nature.
  //   // To get the current value of `fields`, we have to wait for the component to rerender
  //   // the useEffect hook above will continue the process if submitting === true

  //   setDirtyField()
  //   validateField()
  //   submitMutation()
  // }

  if (!clientSecret.length) return null

  return (
    <StyledPanel label='Billing Leaders'>
      <InfoText>
        {
          'All billing leaders are able to see and update credit card information, change plans, and view invoices.'
        }
      </InfoText>
      <StyledRow>
        <AvatarBlock>
          {/* {picture ? (
            <Avatar hasBadge={false} picture={picture} size={44} />
          ) : (
            <img alt='' src={defaultUserAvatar} />
          )} */}
        </AvatarBlock>
        <StyledRowInfo>
          <RowInfoHeader>
            <RowInfoHeading>{'dave'}</RowInfoHeading>
            {/* {isBillingLeader && <RoleTag>{'Billing Leader'}</RoleTag>} */}
            <RoleTag>{'Billing Leader'}</RoleTag>
            {/* {inactive && !isBillingLeader && <InactiveTag>{'Inactive'}</InactiveTag>} */}
            {/* {new Date(newUserUntil) > new Date() && <EmphasisTag>{'New'}</EmphasisTag>} */}
          </RowInfoHeader>
          {/* <RowInfoLink href={`mailto:${email}`} title='Send an email'> */}
          <RowInfoLink title='Send an email'>{'heyy'}</RowInfoLink>
        </StyledRowInfo>
        <RowActions>
          <ActionsBlock>
            {/* {!isBillingLeader && viewerId === userId && ( */}
            {/* // <StyledFlatButton onClick={toggleLeave} onMouseEnter={LeaveOrgModal.preload}> */}
            <StyledFlatButton>Leave Organization</StyledFlatButton>
            {/* )} */}
            {/* {isViewerLastBillingLeader && userId === viewerId && (
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
          )} */}
            {/* {isViewerBillingLeader && !(isViewerLastBillingLeader && userId === viewerId) && (
            <MenuToggleBlock>
              <MenuButton
                onClick={togglePortal}
                onMouseEnter={BillingLeaderActionMenu.preload}
                ref={originRef}
              />
            </MenuToggleBlock>
          )} */}
            {/* {menuPortal(
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
          )} */}
          </ActionsBlock>
        </RowActions>
      </StyledRow>
    </StyledPanel>
  )
}

export default BillingLeaders
