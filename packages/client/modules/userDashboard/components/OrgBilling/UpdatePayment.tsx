import styled from '@emotion/styled'
import {CreditCard} from '@mui/icons-material'
import {
  CardCvcElement,
  CardElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {OrgBillingCreditCardInfo_organization$key} from '~/__generated__/OrgBillingCreditCardInfo_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import SecondaryButton from '../../../../components/SecondaryButton'
import StyledError from '../../../../components/StyledError'
import useModal from '../../../../hooks/useModal'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint, ElementWidth, Layout} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'

const StyledPanel = styled(Panel)<{isWide: boolean}>(({isWide}) => ({
  maxWidth: isWide ? ElementWidth.PANEL_WIDTH : 'inherit'
}))

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

const CreditCardModal = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'CreditCardModal' */
      '../CreditCardModal/CreditCardModal'
    )
)

interface Props {
  organization: OrgBillingCreditCardInfo_organization$key
  hasCheckoutFlowFlag: boolean
}

const UpdatePayment = (props: Props) => {
  const {organization: organizationRef, hasCheckoutFlowFlag} = props
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  // const organization = useFragment(
  //   graphql`
  //     fragment UpdatePayment_organization on Organization {
  //       id
  //       orgUserCount {
  //         activeUserCount
  //       }
  //       creditCard {
  //         brand
  //         expiry
  //         last4
  //       }
  //     }
  //   `,
  //   organizationRef
  // )
  // const {creditCard, id: orgId, orgUserCount} = organization
  // if (!creditCard) return null
  // const {activeUserCount} = orgUserCount
  // const {brand, last4, expiry} = creditCard

  {
    /* <CardElement onChange={handleChange} options={CARD_OPTIONS} /> */
  }
  {
    /* <div className='p-2 pl-6 pr-6'>
    <CardElement
      className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
      options={CARD_OPTIONS}
    />
  </div> */
  }
  return (
    // <StyledForm id='payment-form'>
    <StyledForm id='payment-form'>
      <div className='flex w-full'>
        <div className='w-3/5 pr-4'>
          <label className='block text-left text-xs font-semibold uppercase text-slate-600'>
            Card number
          </label>
          <div className='mt-1'>
            <CardNumberElement
              className='focus:ring-indigo-500 focus:border-indigo-500 block w-full border-b border-slate-400 bg-slate-200 px-4 py-3 shadow-sm outline-none sm:text-sm'
              options={CARD_ELEMENT_OPTIONS}
              // onChange={handleChange('CardNumber')}
            />
            {/* {cardNumberError && <ErrorMsg>{cardNumberError}</ErrorMsg>} */}
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
              // onChange={handleChange('ExpiryDate')}
            />
            {/* {expiryDateError && <ErrorMsg>{expiryDateError}</ErrorMsg>} */}
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
              // onChange={handleChange('CVC')}
            />
            {/* {cvcError && <ErrorMsg>{cvcError}</ErrorMsg>} */}
          </div>
        </div>
      </div>
      <div className='w-1/4'>
        {/* {errorMsg && <ErrorMsg>{errorMsg}</ErrorMsg>} */}
        <UpgradeButton
          isDisabled={false}
          size='medium'
          // isDisabled={isLoading || !stripe || !elements}
          type={'submit'}
        >
          {'Upgrade'}
        </UpgradeButton>
      </div>
    </StyledForm>
  )
}

export default UpdatePayment
