import React, {useEffect, useState} from 'react'
import styled from '@emotion/styled'
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 16
})

const UpgradeButton = styled(PrimaryButton)<{isDisabled: boolean}>(({isDisabled}) => ({
  background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_500,
  color: isDisabled ? PALETTE.SLATE_600 : PALETTE.WHITE,
  boxShadow: 'none',
  marginTop: 16,
  width: '80%',
  elevation: 0,
  '&:hover': {
    boxShadow: 'none',
    background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_600
  }
}))

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      return
    }

    //   stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
    //     switch (paymentIntent.status) {
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
  }, [stripe])

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
        return_url: 'http://localhost:3000'
      }
    })

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      // setMessage(error.message)
    } else {
      // setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  const paymentElementOptions = {
    layout: 'tabs'
  }

  return (
    <form id='payment-form' onSubmit={handleSubmit}>
      {/* <LinkAuthenticationElement
        id='link-authentication-element'
        // onChange={(e) => setEmail(e.target.value)}
      /> */}
      <PaymentElement
        id='payment-element'
        options={{
          fields: {
            billingDetails: {
              address: 'never'
            }
          }
        }}
      />
      {/* <button disabled={isLoading || !stripe || !elements} id='submit'>
        <span id='button-text'>
          {isLoading ? <div className='spinner' id='spinner'></div> : 'Pay now'}
        </span>
      </button> */}
      <ButtonBlock>
        <UpgradeButton
          size='medium'
          // onClick={handleSubmit}
          isDisabled={isLoading || !stripe || !elements}
          type={'submit'}
        >
          {'Upgrade'}
        </UpgradeButton>
      </ButtonBlock>
      {/* Show any error or success messages */}
      {message && <div id='payment-message'>{message}</div>}
    </form>
  )
}
