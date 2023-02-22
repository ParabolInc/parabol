import styled from '@emotion/styled'
import {Error as ErrorIcon} from '@mui/icons-material'
import React, {useEffect, useState} from 'react'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import useForm from '../../../../hooks/useForm'
import useScript from '../../../../hooks/useScript'
import {PALETTE} from '../../../../styles/paletteV3'
import StripeClientManager from '../../../../utils/StripeClientManager'

const StyledPanel = styled(Panel)({
  maxWidth: 976,
  paddingBottom: 16
})

const StyledRow = styled(Row)({
  padding: '12px 16px',
  display: 'flex',
  flex: 1,
  ':first-of-type': {
    paddingTop: 16
  },
  ':nth-of-type(2)': {
    border: 'none'
  }
})

const Plan = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  flex: 1,
  margin: '0 8px',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  padding: '16px',
  height: 400,
  borderRadius: 4,
  width: '50%',
  overflow: 'hidden'
})

const Heading = styled('span')<{isBold?: boolean}>(({isBold}) => ({
  fontWeight: isBold ? 600 : 400,
  fontSize: 16,
  textAlign: 'left'
}))

const HeadingBlock = styled('div')({
  padding: '16px'
})

const LineIcon = styled('div')({
  svg: {
    fontSize: 19
  },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const UpgradeButton = styled(PrimaryButton)<{isDisabled: boolean}>(({isDisabled}) => ({
  flexGrow: 1,
  background: isDisabled ? PALETTE.SLATE_200 : PALETTE.SKY_500,
  color: isDisabled ? PALETTE.SLATE_600 : PALETTE.WHITE,
  boxShadow: 'none',
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
  textAlign: 'center',
  display: 'flex',
  width: '100%',
  paddingBottom: 8,
  justifyContent: 'flex-start'
})

const Content = styled('div')({
  width: '100%'
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  paddingTop: 16
})

const StyledInput = styled('input')({
  appearance: 'none',
  background: PALETTE.SLATE_200,
  border: 'none',
  borderBottom: `1px solid ${PALETTE.SLATE_400}`,
  color: PALETTE.SLATE_800,
  fontSize: 16,
  marginBottom: 16,
  padding: 16,
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

const InputWrapper = styled('div')({
  display: 'flex',
  width: '100%',
  flexWrap: 'nowrap',
  flex: 1,
  justifyContent: 'space-between'
})

const InputBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '47%'
})

const Error = styled('div')<{isError: boolean}>(({isError}) => ({
  alignItems: 'center',
  color: isError ? PALETTE.TOMATO_500 : PALETTE.SLATE_600,
  display: 'flex',
  flex: 1,
  lineHeight: '24px',
  minHeight: 24
}))

const Message = styled('div')({
  fontSize: 15,
  paddingLeft: 4
})

const Billing = () => {
  const [stripeClientManager] = useState(() => new StripeClientManager())
  const {fields, onChange, setDirtyField, validateField} = useForm({
    cardName: {
      getDefault: () => '',
      // normalize: stripeClientManager.normalizeCardName,
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
  const isStripeLoaded = useScript('https://js.stripe.com/v2/')
  const {cardName, cardNumber, cvc, expiry} = fields
  const error =
    // serverError || //TODO: add server error when adding functionality: https://github.com/ParabolInc/parabol/issues/7693
    (cardNumber.dirty && cardNumber.error) ||
    (expiry.dirty && expiry.error) ||
    (cvc.dirty && cvc.error)
  const canSubmit = !!(!error && cardName.value && cardNumber.value && expiry.value && cvc.value)
  console.log('🚀 ~ canSubmit', {canSubmit, error, cardName, cardNumber, expiry, cvc})

  useEffect(() => {
    if (isStripeLoaded) {
      stripeClientManager.init()
    }
  }, [isStripeLoaded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // if (submitting) return
    // these 3 calls internally call dispatch (or setState), which are asynchronous in nature.
    // To get the current value of `fields`, we have to wait for the component to rerender
    // the useEffect hook above will continue the process if submitting === true
    setDirtyField()
    validateField()
    // submitMutation()
  }

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
          <Content>
            <Title>{'Credit Card Details'}</Title>
            <Form>
              <InputLabel>{'Cardholder Name'}</InputLabel>
              <StyledInput
                autoFocus
                maxLength={255}
                placeholder='Full Name'
                onBlur={() => setDirtyField('cardName')}
                onChange={onChange}
                id='cardholder-name'
                name='cardName'
                type='text'
                autoComplete='cc-name'
              />
              <InputLabel>{'Card Number'}</InputLabel>
              <StyledInput
                maxLength={255}
                placeholder='1234 5678 8765 4321'
                onBlur={() => setDirtyField('cardNumber')}
                onChange={onChange}
                id='card-number'
                name={'cardNumber'}
                type='text'
                autoComplete='cc-number'
              />
              <InputWrapper>
                <InputBlock>
                  <InputLabel>{'Expiry Date'}</InputLabel>
                  <StyledInput
                    maxLength={5}
                    placeholder='MM/YY'
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
                  <StyledInput
                    maxLength={5}
                    placeholder='123'
                    onBlur={() => setDirtyField('cvc')}
                    onChange={onChange}
                    id='cvv'
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
                onClick={handleSubmit}
                // waiting={submitting}
                isDisabled={!canSubmit}
                type={'submit'}
              >
                {'Upgrade'}
              </UpgradeButton>
            </Form>
          </Content>
        </Plan>
        <Plan>
          <Content>
            <Title>{'Team Plan Pricing'}</Title>
          </Content>
        </Plan>
      </StyledRow>
    </StyledPanel>
  )
}

export default Billing
