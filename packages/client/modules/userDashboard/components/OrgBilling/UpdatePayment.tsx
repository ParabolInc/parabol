import styled from '@emotion/styled'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import React, {useState} from 'react'
import PrimaryButton from '../../../../components/PrimaryButton'
import SecondaryButton from '../../../../components/SecondaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import UpdateCreditCardMutation from '../../../../mutations/UpdateCreditCardMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import StyledError from '../../../../components/StyledError'
import {UpdateCreditCardMutation$data} from '../../../../__generated__/UpdateCreditCardMutation.graphql'
import {StripeElementChangeEvent} from '@stripe/stripe-js'

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
  setIsUpdating: (isUpdating: boolean) => void
  orgId: string
}

const UpdatePayment = (props: Props) => {
  const {setIsUpdating, orgId} = props
  console.log('🚀 ~ orgId:', orgId)
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
  const [isLoading, setIsLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()
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
  const isUpdateDisabled = isLoading || !stripe || !elements || !hasValidCCDetails

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

    const handleCompletedUpdate = async (res: UpdateCreditCardMutation$data) => {
      const {updateCreditCard} = res
      const {stripeSubscriptionClientSecret, error} = updateCreditCard
      console.log('🚀 ~ updateCreditCard:', updateCreditCard)
      if (error || !stripeSubscriptionClientSecret) {
        const newErrMsg =
          error?.message ?? 'Something went wrong. Please try again or contact support.'
        setIsLoading(false)
        setErrorMsg(newErrMsg)
        return
      }
      const {error: confirmationError} = await stripe.confirmCardPayment(
        stripeSubscriptionClientSecret
      )
      setIsLoading(false)
      if (confirmationError) {
        setErrorMsg(confirmationError.message)
        return
      }
      onCompleted()
      // setIsUpdating(false)
    }

    UpdateCreditCardMutation(
      atmosphere,
      {orgId, paymentMethodId: paymentMethod.id},
      {onError, onCompleted: handleCompletedUpdate}
    )
  }

  const handleChange =
    (type: 'CardNumber' | 'ExpiryDate' | 'CVC') => (event: StripeElementChangeEvent) => {
      if (errorMsg) setErrorMsg(null)
      if (!hasStarted && !event.empty) {
        setHasStarted(true)
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

  return (
    <form className='flex h-full w-full flex-col flex-wrap space-y-reverse' onSubmit={handleSubmit}>
      <div className='flex w-full'>
        <div className='w-3/5 pr-4'>
          <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
            Card number
          </label>
          <div className='mt-1'>
            <CardNumberElement
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleChange('CardNumber')}
            />
          </div>
          {cardNumberError && <ErrorMsg>{cardNumberError}</ErrorMsg>}
        </div>

        <div className='w-1/4 pr-4'>
          <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
            Expiry
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

        <div className='w-1/6'>
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
      <div className='flex w-full flex-nowrap items-center justify-between'>
        <div className='w-1/4'>
          <UpgradeButton
            disabled={isUpdateDisabled}
            isDisabled={isUpdateDisabled}
            size='medium'
            type={'submit'}
          >
            {'Update'}
          </UpgradeButton>
        </div>
        <div className='mt-4 flex w-1/4 justify-end'>
          <SecondaryButton size='medium' type={'submit'} onClick={() => setIsUpdating(false)}>
            {'Cancel'}
          </SecondaryButton>
        </div>
      </div>
    </form>
  )
}

export default UpdatePayment
