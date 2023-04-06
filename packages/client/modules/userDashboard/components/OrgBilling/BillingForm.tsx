import React, {useState} from 'react'
import styled from '@emotion/styled'
import {PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import Confetti from '../../../../components/Confetti'
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsLoading(true)
    const {setupIntent, error} = await stripe.confirmSetup({
      elements,
      redirect: 'if_required'
    })
    setIsLoading(false)
    if (error) return
    const {payment_method: paymentMethodId, status} = setupIntent
    if (status === 'succeeded' && typeof paymentMethodId === 'string') {
      setIsPaymentSuccessful(true)
      const handleCompleted = () => {}
      UpgradeToTeamTierMutation(
        atmosphere,
        {orgId, paymentMethodId},
        {onError, onCompleted: handleCompleted}
      )
    }
  }

  return (
    <StyledForm id='payment-form' onSubmit={handleSubmit}>
      <PaymentElement id='payment-element' options={{layout: 'tabs'}} />
      <ButtonBlock>
        <UpgradeButton size='medium' isDisabled={isLoading || !stripe || !elements} type={'submit'}>
          {'Upgrade'}
        </UpgradeButton>
      </ButtonBlock>
      <Confetti active={isPaymentSuccessful} />
    </StyledForm>
  )
}

export default BillingForm
