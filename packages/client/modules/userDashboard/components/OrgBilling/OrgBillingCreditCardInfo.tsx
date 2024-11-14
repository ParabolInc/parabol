import styled from '@emotion/styled'
import {CreditCard} from '@mui/icons-material'
import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {OrgBillingCreditCardInfo_organization$key} from '~/__generated__/OrgBillingCreditCardInfo_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import SecondaryButton from '../../../../components/SecondaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint, ElementWidth, Layout} from '../../../../types/constEnums'
import UpdatePayment from './UpdatePayment'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

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

const stripePromise = loadStripe(window.__ACTION__.stripe)

interface Props {
  organizationRef: OrgBillingCreditCardInfo_organization$key
}

const OrgBillingCreditCardInfo = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgBillingCreditCardInfo_organization on Organization {
        id
        creditCard {
          brand
          expiry
          last4
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, creditCard} = organization
  const [isUpdating, setIsUpdating] = useState(false)
  if (!creditCard) return null
  const {brand, last4, expiry} = creditCard

  const handleClose = () => {
    setIsUpdating(false)
  }

  const handleStartUpdating = () => {
    setIsUpdating(true)
  }

  if (isUpdating) {
    return (
      <StyledPanel label='Credit Card'>
        <StyledRow>
          <Elements stripe={stripePromise}>
            <UpdatePayment handleClose={handleClose} orgId={orgId} />
          </Elements>
        </StyledRow>
      </StyledPanel>
    )
  }

  return (
    <StyledPanel label='Credit Card'>
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
        <SecondaryButton onClick={handleStartUpdating}>{'Update'}</SecondaryButton>
      </InfoAndUpdate>
    </StyledPanel>
  )
}

export default OrgBillingCreditCardInfo
