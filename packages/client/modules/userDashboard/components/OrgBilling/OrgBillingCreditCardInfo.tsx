import styled from '@emotion/styled'
import {CreditCard} from '@mui/icons-material'
import {CardElement, Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {OrgBillingCreditCardInfo_organization$key} from '~/__generated__/OrgBillingCreditCardInfo_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import SecondaryButton from '../../../../components/SecondaryButton'
import StyledError from '../../../../components/StyledError'
import useModal from '../../../../hooks/useModal'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint, ElementWidth, Layout} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import UpdatePayment from './UpdatePayment'

const StyledPanel = styled(Panel)<{isWide: boolean}>(({isWide}) => ({
  maxWidth: isWide ? ElementWidth.PANEL_WIDTH : 'inherit'
}))

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 16,
  wrap: 'nowrap',
  flexDirection: 'column',
  width: '100%'
})

const StyledForm = styled('form')({
  display: 'flex',
  height: '100%',
  width: '100%',
  flexWrap: 'nowrap',
  flexDirection: 'column',
  alignItems: 'space-between'
})

const UpgradeButton = styled(PrimaryButton)<{isDisabled: boolean}>(({isDisabled}) => ({
  background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_500,
  color: isDisabled ? PALETTE.SLATE_600 : PALETTE.WHITE,
  boxShadow: 'none',
  marginTop: 16,
  width: '100%',
  elevation: 0,
  '&:hover, &:focus': {
    boxShadow: 'none',
    background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_600
  }
}))

const ConfettiWrapper = styled('div')({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
})

const ErrorMsg = styled(StyledError)({
  paddingTop: 8,
  textTransform: 'none'
})

const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      color: PALETTE.SLATE_800,
      fontFamily: '"IBM Plex Sans", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: PALETTE.SLATE_800
      },
      marginBottom: '16px',
      padding: '12px 16px'
    },
    invalid: {
      color: PALETTE.TOMATO_500,
      iconColor: PALETTE.TOMATO_500
    }
  }
}

const CreditCardInfo = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: 14,
  lineHeight: '20px'
})

const CreditCardIcon = styled(CreditCard)({
  color: PALETTE.SLATE_600,
  marginRight: 16
})

const CreditCardProvider = styled('span')({
  fontWeight: 600,
  marginRight: 8
})

const CreditCardNumber = styled('span')({
  marginRight: 32
})

const CreditCardExpiresLabel = styled('span')({
  fontWeight: 600,
  marginRight: 8
})

const InfoAndUpdate = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER,
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between'
})

const StyledRow = styled(Row)({
  flexWrap: 'nowrap'
})

const InfoBlocks = styled('div')({
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    alignItems: 'center',
    display: 'flex'
  }
})

const CreditCardModal = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'CreditCardModal' */
      '../CreditCardModal/CreditCardModal'
    )
)

const stripePromise = loadStripe(window.__ACTION__.stripe)

interface Props {
  organization: OrgBillingCreditCardInfo_organization$key
  hasCheckoutFlowFlag: boolean
}

const OrgBillingCreditCardInfo = (props: Props) => {
  const {organization: organizationRef, hasCheckoutFlowFlag} = props
  const organization = useFragment(
    graphql`
      fragment OrgBillingCreditCardInfo_organization on Organization {
        id
        orgUserCount {
          activeUserCount
        }
        creditCard {
          brand
          expiry
          last4
        }
      }
    `,
    organizationRef
  )
  const {creditCard, id: orgId, orgUserCount} = organization
  const [isUpdating, setIsUpdating] = useState(false)
  if (!creditCard) return null
  const {activeUserCount} = orgUserCount
  const {brand, last4, expiry} = creditCard

  if (isUpdating) {
    return (
      <StyledPanel label='Credit Card' isWide={!!hasCheckoutFlowFlag}>
        <StyledForm id='payment-form'>
          <StyledRow>
            <Elements stripe={stripePromise}>
              <UpdatePayment />
            </Elements>
          </StyledRow>
        </StyledForm>
      </StyledPanel>
    )
  }

  const handleClick = () => {
    setIsUpdating(true)
  }

  return (
    <StyledPanel label='Credit Card' isWide={!!hasCheckoutFlowFlag}>
      <InfoAndUpdate>
        <CreditCardInfo>
          <CreditCardIcon />
          <InfoBlocks>
            <div>
              <CreditCardProvider>{brand}</CreditCardProvider>
              <CreditCardNumber>
                {'•••• •••• •••• '}
                {last4}
              </CreditCardNumber>
            </div>
            <div>
              <CreditCardExpiresLabel>{'Expires'}</CreditCardExpiresLabel>
              <span>{expiry}</span>
            </div>
          </InfoBlocks>
        </CreditCardInfo>
        <SecondaryButton onClick={handleClick}>{'Update'}</SecondaryButton>
        {/* {modalPortal(
          <CreditCardModal
            activeUserCount={activeUserCount}
            orgId={orgId}
            actionType={'update'}
            closePortal={closePortal}
          />
        )} */}
      </InfoAndUpdate>
    </StyledPanel>
  )
}

export default OrgBillingCreditCardInfo
