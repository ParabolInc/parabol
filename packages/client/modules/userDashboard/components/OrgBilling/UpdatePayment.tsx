import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import type {StripeElementChangeEvent} from '@stripe/stripe-js'
import type * as React from 'react'
import {useState} from 'react'
import type {UpdateCreditCardMutation$data} from '../../../../__generated__/UpdateCreditCardMutation.graphql'
import PrimaryButton from '../../../../components/PrimaryButton'
import SecondaryButton from '../../../../components/SecondaryButton'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import UpdateCreditCardMutation from '../../../../mutations/UpdateCreditCardMutation'
import {Elevation} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {cn} from '../../../../ui/cn'

const getCardElementOptions = () => {
  const isDark = document.documentElement.classList.contains('theme-dark')
  return {
    style: {
      base: {
        color: isDark ? '#EEEDF7' : PALETTE.SLATE_800,
        fontFamily: '"IBM Plex Sans", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: isDark ? '#938CBF' : PALETTE.SLATE_600
        }
      }
    }
  }
}

type Props = {
  handleClose: () => void
  orgId: string
}

const UpdatePayment = (props: Props) => {
  const {handleClose, orgId} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
  const [isLoading, setIsLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()
  const [errorMsg, setErrorMsg] = useState<null | string>()
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
  const cardElementOptions = getCardElementOptions()

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
      handleClose()
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
          <label className='block text-left font-semibold text-fg-secondary text-xs uppercase'>
            Card number
          </label>
          <div className='mt-1'>
            <CardNumberElement
              className='block w-full border-hairline-field border-b bg-surface-well px-4 py-3 shadow-xs outline-hidden focus:border-accent focus:ring-accent sm:text-sm'
              options={cardElementOptions}
              onChange={handleChange('CardNumber')}
            />
          </div>
          {cardNumberError && (
            <StyledError className='pt-2 normal-case'>{cardNumberError}</StyledError>
          )}
        </div>

        <div className='w-1/4 pr-4'>
          <label className='block text-left font-semibold text-fg-secondary text-xs uppercase'>
            Expiry
          </label>
          <div className='mt-1'>
            <CardExpiryElement
              className='block w-full border-hairline-field border-b bg-surface-well px-4 py-3 shadow-xs outline-hidden focus:border-accent focus:ring-accent sm:text-sm'
              options={cardElementOptions}
              onChange={handleChange('ExpiryDate')}
            />
            {expiryDateError && (
              <StyledError className='pt-2 normal-case'>{expiryDateError}</StyledError>
            )}
          </div>
        </div>

        <div className='w-1/6'>
          <label className='block text-left font-semibold text-fg-secondary text-xs uppercase'>
            CVC
          </label>
          <div className='mt-1'>
            <CardCvcElement
              className='block w-full border-hairline-field border-b bg-surface-well px-4 py-3 shadow-xs outline-hidden focus:border-accent focus:ring-accent sm:text-sm'
              options={cardElementOptions}
              onChange={handleChange('CVC')}
            />
            {cvcError && <StyledError className='pt-2 normal-case'>{cvcError}</StyledError>}
          </div>
        </div>
      </div>
      <div className='flex justify-start'>
        {errorMsg && <StyledError className='pt-2 normal-case'>{errorMsg}</StyledError>}
      </div>
      <div className='flex w-full flex-nowrap items-center justify-between'>
        <div className='mt-4 w-1/8'>
          <SecondaryButton className='w-full' size='medium' type='button' onClick={handleClose}>
            {'Cancel'}
          </SecondaryButton>
        </div>
        <div className='flex w-1/6 justify-end'>
          <PrimaryButton
            className={cn(
              'mt-4 w-full bg-none bg-sky-500 hover:bg-none focus:bg-none active:bg-none',
              isUpdateDisabled ? 'opacity-50' : 'hover:bg-sky-600 focus:bg-sky-600'
            )}
            elevationResting={Elevation.Z0}
            elevationHovered={Elevation.Z0}
            disabled={isUpdateDisabled}
            size='medium'
            type={'submit'}
          >
            {'Update'}
          </PrimaryButton>
        </div>
      </div>
    </form>
  )
}

export default UpdatePayment
