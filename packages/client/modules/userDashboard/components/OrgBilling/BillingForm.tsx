import React, {useState} from 'react'
import styled from '@emotion/styled'
import {PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import Confetti from '../../../../components/Confetti'
import StyledError from '../../../../components/StyledError'
import UpgradeToTeamTierMutation from '../../../../mutations/UpgradeToTeamTierMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'

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

type Props = {
  orgId: string
}

export default function BillingForm(props: Props) {
  const {orgId} = props
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false)
  const atmosphere = useAtmosphere()
  const {onError} = useMutationProps()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsLoading(true)
    const {setupIntent, error} = await stripe.confirmSetup({
      elements,
      redirect: 'if_required'
    })
    const {payment_method: paymentMethodId, status} = setupIntent
    console.log('🚀 ~ setupIntent:', {setupIntent, paymentMethodId, status})

    if (!error && status === 'succeeded' && paymentMethodId) {
      setIsPaymentSuccessful(true)
      const handleCompleted = () => {}
      UpgradeToTeamTierMutation(
        atmosphere,
        {orgId, paymentMethodId},
        {onError, onCompleted: handleCompleted}
      )
    } else if (error?.type === 'card_error' || error?.type === 'validation_error') {
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
