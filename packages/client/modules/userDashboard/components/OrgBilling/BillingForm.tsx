import styled from '@emotion/styled'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import {StripeElementChangeEvent} from '@stripe/stripe-js'
import React, {useState} from 'react'
import {CreateStripeSubscriptionMutation$data} from '../../../../__generated__/CreateStripeSubscriptionMutation.graphql'
import Ellipsis from '../../../../components/Ellipsis/Ellipsis'
import PrimaryButton from '../../../../components/PrimaryButton'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import CreateStripeSubscriptionMutation from '../../../../mutations/CreateStripeSubscriptionMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'

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

const ErrorMsg = styled(StyledError)({
  paddingTop: 8,
  textTransform: 'none'
})

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: PALETTE.SLATE_800,
      fontFamily: '"IBM Plex Sans", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: PALETTE.SLATE_600
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
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
  const [errorMsg, setErrorMsg] = useState<null | string>()
  const [hasStarted, setHasStarted] = useState(false)
  const [cardNumberError, setCardNumberError] = useState<null | string>()
  const [expiryDateError, setExpiryDateError] = useState<null | string>()
  const [cvcError, setCvcError] = useState<null | string>()
  const [cardNumberComplete, setCardNumberComplete] = useState(false)
  const [expiryDateComplete, setExpiryDateComplete] = useState(false)
  const [cvcComplete, setCvcComplete] = useState(false)
  const hasValidCCDetails =
    cardNumberComplete &&
    expiryDateComplete &&
    cvcComplete &&
    !cardNumberError &&
    !expiryDateError &&
    !cvcError
  const isUpgradeDisabled = isLoading || !stripe || !elements || !hasValidCCDetails

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsLoading(true)
    if (errorMsg) {
      setIsLoading(false)
      setErrorMsg(null)
      return
    }
    const cardElement = elements.getElement(CardNumberElement)
    if (!cardElement) {
      setIsLoading(false)
      const newErrorMsg = 'Something went wrong. Please try again.'
      setErrorMsg(newErrorMsg)
      return
    }
    const {paymentMethod, error} = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement
    })
    if (error) {
      setErrorMsg(error.message)
      setIsLoading(false)
      return
    }

    const handleCompletedSubscription = async (res: CreateStripeSubscriptionMutation$data) => {
      const {createStripeSubscription} = res
      const stripeSubscriptionClientSecret =
        createStripeSubscription?.stripeSubscriptionClientSecret
      if (createStripeSubscription.error || !stripeSubscriptionClientSecret) {
        const newErrMsg =
          createStripeSubscription.error?.message ??
          'Something went wrong. Please try again or contact support.'
        setIsLoading(false)
        setErrorMsg(newErrMsg)
        return
      }
      const {error} = await stripe.confirmCardPayment(stripeSubscriptionClientSecret)
      if (error) {
        setErrorMsg(error.message)
        setIsLoading(false)
        return
      }
      onCompleted()
    }

    CreateStripeSubscriptionMutation(
      atmosphere,
      {orgId, paymentMethodId: paymentMethod.id},
      {onError, onCompleted: handleCompletedSubscription}
    )
  }

  const handleChange =
    (type: 'CardNumber' | 'ExpiryDate' | 'CVC') => (event: StripeElementChangeEvent) => {
      if (errorMsg) setErrorMsg(null)
      if (!hasStarted && !event.empty) {
        SendClientSideEvent(atmosphere, 'Payment Details Started', {orgId})
        setHasStarted(true)
      }
      if (event.complete) {
        SendClientSideEvent(atmosphere, 'Payment Details Complete', {orgId})
      }

      const errorSetters = {
        CardNumber: setCardNumberError,
        ExpiryDate: setExpiryDateError,
        CVC: setCvcError
      }

      const completionSetters = {
        CardNumber: setCardNumberComplete,
        ExpiryDate: setExpiryDateComplete,
        CVC: setCvcComplete
      }

      if (event.error) {
        errorSetters[type](event.error.message)
      } else {
        errorSetters[type](null)
      }

      completionSetters[type](event.complete)
    }

  if (!stripe || !elements) return null
  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-4'>
        <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
          Card number
        </label>

        <div className='mt-1'>
          <CardNumberElement
            className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleChange('CardNumber')}
          />
          {cardNumberError && <ErrorMsg>{cardNumberError}</ErrorMsg>}
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
              onChange={handleChange('ExpiryDate')}
            />
            {expiryDateError && <ErrorMsg>{expiryDateError}</ErrorMsg>}
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
              onChange={handleChange('CVC')}
            />
            {cvcError && <ErrorMsg>{cvcError}</ErrorMsg>}
          </div>
        </div>
      </div>
      <ButtonBlock>
        {errorMsg && <ErrorMsg>{errorMsg}</ErrorMsg>}
        <UpgradeButton
          size='medium'
          disabled={isUpgradeDisabled}
          isDisabled={isUpgradeDisabled}
          type={'submit'}
        >
          {isLoading ? (
            <>
              Upgrading <Ellipsis />
            </>
          ) : (
            'Upgrade'
          )}
        </UpgradeButton>
      </ButtonBlock>
    </form>
  )
}

export default BillingForm
