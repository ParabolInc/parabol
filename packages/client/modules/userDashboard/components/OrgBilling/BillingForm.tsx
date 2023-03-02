import React, {useState} from 'react'
import styled from '@emotion/styled'
import {PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 16,
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

const PaymentWrapper = styled('div')({
  height: 160
})

const UpgradeButton = styled(PrimaryButton)<{isDisabled: boolean}>(({isDisabled}) => ({
  background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_500,
  color: isDisabled ? PALETTE.SLATE_600 : PALETTE.WHITE,
  boxShadow: 'none',
  marginTop: 16,
  width: '100%',
  elevation: 0,
  '&:hover': {
    boxShadow: 'none',
    background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_600
  }
}))

export default function BillingForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  // TODO: implement in: https://github.com/ParabolInc/parabol/issues/7693
  // look at: https://stripe.com/docs/payments/quickstart
  const handleSubmit = async () => {
    setIsLoading(false)
  }

  if (!stripe || !elements) return null

  return (
    <StyledForm id='payment-form' onSubmit={handleSubmit}>
      <PaymentWrapper>
        <PaymentElement
          id='payment-element'
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                address: 'never'
              }
            }
          }}
        />
      </PaymentWrapper>
      <ButtonBlock>
        <UpgradeButton size='medium' isDisabled={isLoading || !stripe || !elements} type={'submit'}>
          {'Upgrade'}
        </UpgradeButton>
      </ButtonBlock>
    </StyledForm>
  )
}
