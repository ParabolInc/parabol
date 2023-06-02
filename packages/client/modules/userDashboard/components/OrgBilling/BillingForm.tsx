import React, {useState} from 'react'
import styled from '@emotion/styled'
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import Confetti from '../../../../components/Confetti'
import UpgradeToTeamTierMutation from '../../../../mutations/UpgradeToTeamTierMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import StyledError from '../../../../components/StyledError'
import SendClientSegmentEventMutation from '../../../../mutations/SendClientSegmentEventMutation'
import CreateStripeSubscriptionMutation from '../../../../mutations/CreateStripeSubscriptionMutation'
import {StripeCardElementChangeEvent} from '@stripe/stripe-js'
import {CreateStripeSubscriptionMutation$data} from '../../../../__generated__/CreateStripeSubscriptionMutation.graphql'
import {commitLocalUpdate} from 'relay-runtime'

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

type Props = {
  orgId: string
}

const BillingForm = (props: Props) => {
  const {orgId} = props
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false)
  const atmosphere = useAtmosphere()
  const {onError} = useMutationProps()
  const [errorMsg, setErrorMsg] = useState<null | string>()
  const [hasStarted, setHasStarted] = useState(false)

  const handleUpgradeCompleted = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const org = store.get(orgId)
      if (!org) return
      org.setValue(true, 'showDrawer')
    })
    setIsLoading(false)
    setIsPaymentSuccessful(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsLoading(true)
    if (errorMsg) setErrorMsg(null)
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return
    const {paymentMethod, error} = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement
    })
    if (error) {
      setErrorMsg(error.message)
      return
    }

    const handleSubscriptionCompleted = async (res: CreateStripeSubscriptionMutation$data) => {
      const {createStripeSubscription} = res
      const stripeSubscriptionClientSecret =
        createStripeSubscription?.stripeSubscriptionClientSecret
      if (!stripeSubscriptionClientSecret || createStripeSubscription?.error) {
        setErrorMsg('Something went wrong. Please try again or contact support.')
        setIsLoading(false)
        return
      }
      const {error} = await stripe.confirmCardPayment(stripeSubscriptionClientSecret)
      if (error) {
        setErrorMsg(error.message)
        setIsLoading(false)
        return
      }
      UpgradeToTeamTierMutation(atmosphere, {orgId}, {onError, onCompleted: handleUpgradeCompleted})
    }

    CreateStripeSubscriptionMutation(
      atmosphere,
      {orgId, paymentMethodId: paymentMethod.id},
      {onError, onCompleted: handleSubscriptionCompleted}
    )
  }

  const handleChange = (event: StripeCardElementChangeEvent) => {
    if (!hasStarted && !event.empty) {
      SendClientSegmentEventMutation(atmosphere, 'Payment Details Started', {orgId})
      setHasStarted(true)
    }
    if (event.complete) {
      SendClientSegmentEventMutation(atmosphere, 'Payment Details Complete', {orgId})
    }
  }

  return (
    <StyledForm id='payment-form' onSubmit={handleSubmit}>
      <CardElement onChange={handleChange} options={CARD_OPTIONS} />
      <ButtonBlock>
        {errorMsg && <ErrorMsg>{errorMsg}</ErrorMsg>}
        <UpgradeButton size='medium' isDisabled={isLoading || !stripe || !elements} type={'submit'}>
          {'Upgrade'}
        </UpgradeButton>
      </ButtonBlock>
      <ConfettiWrapper>
        <Confetti active={isPaymentSuccessful} />
      </ConfettiWrapper>
    </StyledForm>
  )
}

export default BillingForm
