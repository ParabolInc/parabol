import React, {useEffect, useState} from 'react'
import styled from '@emotion/styled'
import {
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
  CardElement
} from '@stripe/react-stripe-js'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'

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

type Props = {
  clientSecret: string
}

export default function BillingForm(props: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const {clientSecret} = props

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // TODO: implement in: https://github.com/ParabolInc/parabol/issues/7693
  // look at: https://stripe.com/docs/payments/quickstart
  // const handleSubmit = async () => {
  //   setIsLoading(false)
  // }

  // useEffect(() => {
  //   if (!stripe) {
  //     return
  //   }

  //   const clientSecret = new URLSearchParams(window.location.search).get(
  //     'payment_intent_client_secret'
  //   )
  //   console.log('🚀 ~ clientSecret:', clientSecret)

  //   if (!clientSecret) {
  //     return
  //   }

  //   stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
  //     console.log('🚀 ~ paymentIntent:', paymentIntent)

  //     switch (paymentIntent?.status) {
  //       case 'succeeded':
  //         setMessage('Payment succeeded!')
  //         break
  //       case 'processing':
  //         setMessage('Your payment is processing.')
  //         break
  //       case 'requires_payment_method':
  //         setMessage('Your payment was not successful, please try again.')
  //         break
  //       default:
  //         setMessage('Something went wrong.')
  //         break
  //     }
  //   })
  // }, [stripe])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)

    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: 'http://localhost:3000',
        payment_method_data: {
          billing_details: {
            name: 'Dave',
            address: {
              line1: '510 Townsend St',
              line2: '5103 Townsend St',
              city: 'San Francisco',
              country: 'US',
              postal_code: '94107',
              state: 'CA'
            }
          }
        }
      }
    })
    console.log('🚀 ~ error:', error)

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      // setMessage(error.message)
    } else {
      setMessage('An unexpected error occurred.')
    }

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
