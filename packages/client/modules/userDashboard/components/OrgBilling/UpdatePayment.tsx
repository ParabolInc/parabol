import styled from '@emotion/styled'
import {CardCvcElement, CardExpiryElement, CardNumberElement} from '@stripe/react-stripe-js'
import React from 'react'
import PrimaryButton from '../../../../components/PrimaryButton'
import SecondaryButton from '../../../../components/SecondaryButton'
import {PALETTE} from '../../../../styles/paletteV3'

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
  handleCancel: () => void
}

const UpdatePayment = (props: Props) => {
  const {handleCancel} = props

  return (
    <div className='flex h-full w-full flex-col flex-wrap space-y-reverse' id='payment-form'>
      <div className='flex w-full'>
        <div className='w-3/5 pr-4'>
          <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
            Card number
          </label>
          <div className='mt-1'>
            <CardNumberElement
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
              options={CARD_ELEMENT_OPTIONS}
            />
          </div>
        </div>

        <div className='w-1/4 pr-4'>
          <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
            Expiry date
          </label>
          <div className='mt-1'>
            <CardExpiryElement
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
              options={CARD_ELEMENT_OPTIONS}
            />
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
            />
          </div>
        </div>
      </div>
      <div className='flex w-full flex-nowrap items-center justify-between'>
        <div className='w-1/4'>
          <UpgradeButton isDisabled={false} size='medium' type='submit'>
            {'Update'}
          </UpgradeButton>
        </div>
        <div className='mt-4 flex w-1/4 justify-end'>
          <SecondaryButton size='medium' type='button' onClick={handleCancel}>
            {'Cancel'}
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}

export default UpdatePayment
