import React, {useState} from 'react'
import styled from '@emotion/styled'
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  CardElement,
  useElements
} from '@stripe/react-stripe-js'

import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import Confetti from '../../../../components/Confetti'
import UpgradeToTeamTierMutation from '../../../../mutations/UpgradeToTeamTierMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import StyledError from '../../../../components/StyledError'
import {UpgradeToTeamTierMutation$data} from '../../../../__generated__/UpgradeToTeamTierMutation.graphql'
import SendClientSegmentEventMutation from '../../../../mutations/SendClientSegmentEventMutation'
import {StripeCardElementChangeEvent} from '@stripe/stripe-js'

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 16,
  wrap: 'nowrap',
  flexDirection: 'column',
  width: '100%'
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

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: PALETTE.SLATE_800,
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: PALETTE.SLATE_600
      }
    },
    invalid: {
      color: PALETTE.TOMATO_500
    }
  }
}

const CARD_CVC_OPTIONS = {
  ...CARD_ELEMENT_OPTIONS,
  style: {
    ...CARD_ELEMENT_OPTIONS.style,
    base: {
      ...CARD_ELEMENT_OPTIONS.style.base,
      '::placeholder': {
        content: '123'
      }
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

    const handleCompleted = async (res: UpgradeToTeamTierMutation$data) => {
      const {upgradeToTeamTier} = res
      const stripeSubscriptionClientSecret = upgradeToTeamTier?.stripeSubscriptionClientSecret
      if (!stripeSubscriptionClientSecret) {
        setIsLoading(false)
        return
      }
      const {error} = await stripe.confirmCardPayment(stripeSubscriptionClientSecret)
      if (error) {
        setErrorMsg(error.message)
        setIsLoading(false)
        return
      }
      setIsLoading(false)
      setIsPaymentSuccessful(true)
    }

    UpgradeToTeamTierMutation(
      atmosphere,
      {orgId, paymentMethodId: paymentMethod.id},
      {onError, onCompleted: handleCompleted}
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
    <form>
      <div className='mb-4'>
        <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
          Card number
        </label>

        <div className='mt-1'>
          <CardNumberElement
            className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className='flex space-x-5'>
        <div className='w-1/2'>
          <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
            Expiry date
          </label>
          <div className='mt-1'>
            <CardExpiryElement
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className='w-1/2'>
          <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
            CVC
          </label>
          <div className='mt-1'>
            <CardCvcElement
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <ButtonBlock>
        {errorMsg && <ErrorMsg>{errorMsg}</ErrorMsg>}
        <UpgradeButton size='medium' isDisabled={isLoading || !stripe || !elements} type={'submit'}>
          {'Upgrade'}
        </UpgradeButton>
      </ButtonBlock>
      <ConfettiWrapper>
        <Confetti active={isPaymentSuccessful} />
      </ConfettiWrapper>
    </form>
  )
}

export default BillingForm
