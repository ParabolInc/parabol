import React, {useState} from 'react'
import styled from '@emotion/styled'
import {PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import Confetti from '../../../../components/Confetti'
import StyledError from '../../../../components/StyledError'

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 16,
  wrap: 'nowrap',
  flexDirection: 'column',
  width: '100%'
})

const ErrorMessage = styled(StyledError)({
  width: '100%',
  textAlign: 'center'
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
  '&:hover': {
    boxShadow: 'none',
    background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_600
  }
}))

export default function BillingForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsLoading(true)

    const {error} = await stripe.confirmPayment({
      elements,
      redirect: 'if_required' // https://stripe.com/docs/js/payment_intents/confirm_payment#confirm_payment_intent-options-redirect
    })

    if (!error) {
      setIsPaymentSuccessful(true)
    }

    console.log('🚀 ~ error:', error)

    // This point will only be reached if there is an immediate error when confirming the payment
    if (error?.type === 'card_error' || error?.type === 'validation_error') {
      setErrorMessage(error.message)
    } else if (error) {
      setErrorMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  return (
    <StyledForm id='payment-form' onSubmit={handleSubmit}>
      <PaymentElement id='payment-element' options={{layout: 'tabs'}} />
      <ButtonBlock>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <UpgradeButton size='medium' isDisabled={isLoading || !stripe || !elements} type={'submit'}>
          {'Upgrade'}
        </UpgradeButton>
      </ButtonBlock>
      <Confetti active={isPaymentSuccessful} />
    </StyledForm>
  )
}
