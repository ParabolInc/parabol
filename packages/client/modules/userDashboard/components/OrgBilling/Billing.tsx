import styled from '@emotion/styled'
import {Error as ErrorIcon} from '@mui/icons-material'
import useScript from '../../../../hooks/useScript'
import {Divider} from '@mui/material'
import Cleave from 'cleave.js/react'
import React, {useEffect, useState} from 'react'
import BillingForm from './BillingForm'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import useForm from '../../../../hooks/useForm'
import {PALETTE} from '../../../../styles/paletteV3'
import StripeClientManager from '../../../../utils/StripeClientManager'
import {loadStripe} from '@stripe/stripe-js'
import {Elements} from '@stripe/react-stripe-js'
import CreatePaymentIntentMutation from '../../../../mutations/CreatePaymentIntentMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'

const StyledPanel = styled(Panel)({
  maxWidth: 976,
  paddingBottom: 16
})

const StyledRow = styled(Row)({
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'flex-start',
  ':nth-of-type(2)': {
    border: 'none'
  }
})

const Plan = styled('div')({
  lineHeight: '16px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  padding: '0px 16px 16px 16px',
  flexWrap: 'wrap',
  width: '50%',
  overflow: 'hidden'
})

const Heading = styled('span')<{isBold?: boolean}>(({isBold}) => ({
  fontWeight: isBold ? 600 : 400,
  fontSize: 16,
  textAlign: 'left'
}))

const HeadingBlock = styled('div')({
  padding: '16px 16px 0px 16px'
})

const LineIcon = styled('div')({
  svg: {
    fontSize: 19
  },
  display: 'flex'
})

const UpgradeButton = styled(PrimaryButton)<{isDisabled: boolean}>(({isDisabled}) => ({
  background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_500,
  color: isDisabled ? PALETTE.SLATE_600 : PALETTE.WHITE,
  boxShadow: 'none',
  marginTop: 16,
  elevation: 0,
  '&:hover': {
    boxShadow: 'none',
    background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_600
  }
}))

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 22,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  display: 'flex',
  width: '100%',
  paddingBottom: 16
})

const Subtitle = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  display: 'flex',
  paddingBottom: 8
})

const Content = styled('div')({
  width: '100%'
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
})

const StyledInput = styled('input')({
  background: PALETTE.SLATE_200,
  border: 'none',
  borderBottom: `1px solid ${PALETTE.SLATE_400}`,
  color: PALETTE.SLATE_800,
  fontSize: 16,
  marginBottom: 16,
  padding: '12px 16px',
  outline: 0,
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const CleaveInput = styled(Cleave)({
  background: PALETTE.SLATE_200,
  border: 'none',
  borderBottom: `1px solid ${PALETTE.SLATE_400}`,
  color: PALETTE.SLATE_800,
  fontSize: 16,
  marginBottom: 16,
  padding: '12px 16px',
  outline: 0,
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const InputLabel = styled('span')({
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'left',
  paddingBottom: 4,
  color: PALETTE.SLATE_600,
  textTransform: 'uppercase'
})

const InfoText = styled('span')({
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'left',
  paddingBottom: 8,
  color: PALETTE.SLATE_600,
  textTransform: 'none'
})

const InputWrapper = styled('div')({
  display: 'flex',
  width: '100%',
  flexWrap: 'nowrap',
  justifyContent: 'space-between'
})

const InputBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '47%'
})

const TotalBlock = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 16
})

const ActiveUserBlock = styled('div')({
  paddingTop: 16
})

const Error = styled('div')<{isError: boolean}>(({isError}) => ({
  alignItems: 'center',
  color: isError ? PALETTE.TOMATO_500 : PALETTE.SLATE_600,
  display: isError ? 'flex' : 'none',
  lineHeight: '24px'
}))

const Message = styled('div')({
  fontSize: 15,
  paddingLeft: 4
})

const stripePromise = loadStripe('pk_test_MNoKbCzQX0lhktuxxI7M14wd')

const Billing = () => {
  const [stripeClientManager] = useState(() => new StripeClientManager())
  const {fields, onChange, setDirtyField} = useForm({
    cardName: {
      getDefault: () => '',
      nomralize: stripeClientManager.normalizeCardName,
      validate: stripeClientManager.validateCardName
    },
    cardNumber: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeCardNumber,
      validate: stripeClientManager.validateCardNumber
    },
    cvc: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeCVC,
      validate: stripeClientManager.validateCVC
    },
    expiry: {
      getDefault: () => '',
      normalize: stripeClientManager.normalizeExpiry,
      validate: stripeClientManager.validateExpiry
    }
  })

  const [clientSecret, setClientSecret] = useState('')
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()

  const isStripeLoaded = useScript('https://js.stripe.com/v2/')

  useEffect(() => {
    const myOnComplete = (res, errors) => {
      if (errors) {
        onError(errors)
        return
      }
      const {createPaymentIntent} = res
      const {clientSecret} = createPaymentIntent
      setClientSecret(clientSecret)
    }
    CreatePaymentIntentMutation(atmosphere, {}, {onError, onCompleted: myOnComplete})
  }, [])

  const appearance = {
    theme: 'stripe'
  } as const
  const options = {
    // TODO: add this
    clientSecret,
    appearance,
    fonts: [
      {
        family: 'IBM Plex Sans',
        src: `url('/static/fonts/IBMPlexSans-Regular.woff2') format('woff2')`,
        weight: '400'
      }
    ]
  }

  const {cardName, cardNumber, cvc, expiry} = fields
  const error =
    // serverError || //TODO: add server error when adding functionality: https://github.com/ParabolInc/parabol/issues/7693
    (cardNumber.dirty && cardNumber.error) ||
    (expiry.dirty && expiry.error) ||
    (cvc.dirty && cvc.error)
  const canSubmit = !!(!error && cardName.value && cardNumber.value && expiry.value && cvc.value)

  // TODO: add functionality in https://github.com/ParabolInc/parabol/issues/7693
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   // if (submitting) return
  //   // these 3 calls internally call dispatch (or setState), which are asynchronous in nature.
  //   // To get the current value of `fields`, we have to wait for the component to rerender
  //   // the useEffect hook above will continue the process if submitting === true

  //   setDirtyField()
  //   validateField()
  //   submitMutation()
  // }

  if (!clientSecret.length) return null

  return (
    <StyledPanel label='Credit Card'>
      <StyledRow>
        <HeadingBlock>
          <Heading>{'Your next payment is due on '}</Heading>
          <Heading isBold>{' November 17, 2023.'}</Heading>
        </HeadingBlock>
      </StyledRow>
      <StyledRow>
        <Plan>
          <Title>{'Credit Card Details'}</Title>
          <Content>
            <Elements options={options} stripe={stripePromise}>
              <BillingForm />
            </Elements>

            {/* <Form>
              <InputLabel>{'Cardholder Name'}</InputLabel>
              <StyledInput
                autoFocus
                maxLength={100}
                placeholder='Full Name'
                onBlur={() => setDirtyField('cardName')}
                onChange={onChange}
                id='cardholder-name'
                name='cardName'
                type='text'
                autoComplete='cc-name'
              />
              <InputLabel>{'Card Number'}</InputLabel>
              <CleaveInput
                options={{creditCard: true}}
                autoComplete='cc-number'
                id='card-number'
                placeholder='1234 5678 8765 4321'
                name={'cardNumber'}
                onBlur={() => setDirtyField('cardNumber')}
                onChange={onChange}
                type='text'
              />
              <InputWrapper>
                <InputBlock>
                  <InputLabel>{'Expiry Date'}</InputLabel>
                  <CleaveInput
                    maxLength={5}
                    placeholder='MM/YY'
                    options={{date: true, datePattern: ['m', 'd']}}
                    onChange={onChange}
                    onBlur={() => setDirtyField('expiry')}
                    id='expiry'
                    name={'expiry'}
                    type='text'
                    autoComplete='cc-exp'
                  />
                </InputBlock>
                <InputBlock>
                  <InputLabel>{'CVV'}</InputLabel>
                  <CleaveInput
                    maxLength={5}
                    placeholder='123'
                    onBlur={() => setDirtyField('cvc')}
                    onChange={onChange}
                    id='cvv'
                    options={{
                      blocks: [4],
                      numericOnly: true
                    }}
                    name={'cvc'}
                    type='text'
                    autoComplete='cc-csc'
                  />
                </InputBlock>
              </InputWrapper>
              <Error isError={!!error}>
                <LineIcon>{error && <ErrorIcon />}</LineIcon>
                <Message>{error}</Message>
              </Error>
              <UpgradeButton
                size='medium'
                // onClick={handleSubmit}
                isDisabled={!canSubmit}
                type={'submit'}
              >
                {'Upgrade'}
              </UpgradeButton>
            </Form> */}
          </Content>
        </Plan>
        <Plan>
          <Title>{'Team Plan Pricing'}</Title>
          <Content>
            <InputLabel>{'Billing Cycle'}</InputLabel>
            <Subtitle>{'Monthly'}</Subtitle>
            <ActiveUserBlock>
              <InputLabel>{'Active Users'}</InputLabel>
              <InfoText>
                {'Active users are anyone who uses Parabol within a billing period'}
              </InfoText>
              <Subtitle>{'27'}</Subtitle>
            </ActiveUserBlock>
            <Divider />
            <TotalBlock>
              <Subtitle>{'Total'}</Subtitle>
              <Subtitle>{'$162.00'}</Subtitle>
            </TotalBlock>
            <InfoText>{'All prices are in USD'}</InfoText>
          </Content>
        </Plan>
      </StyledRow>
    </StyledPanel>
  )
}

export default Billing
