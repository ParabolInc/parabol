import styled from '@emotion/styled'
import React, {useEffect, useState} from 'react'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import useForm from '../../../../hooks/useForm'
import useScript from '../../../../hooks/useScript'
import {PALETTE} from '../../../../styles/paletteV3'
import StripeClientManager from '../../../../utils/StripeClientManager'
import CreditCardErrorLine from '../CreditCardModal/CreditCardErrorLine'

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
  border: `2px solid red`,
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

const Billing = () => {
  const [stripeClientManager] = useState(() => new StripeClientManager())
  const {fields, onChange, setDirtyField, validateField} = useForm({
    creditCardNumber: {
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
  useEffect(() => {
    if (isStripeLoaded) {
      stripeClientManager.init()
    }
  }, [isStripeLoaded])
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
                // ref={ref}
                id='cardholder-name'
                name='cardholderName'
                type='text'
                autoComplete='cc-name'
              />
              <InputLabel>{'Card Number'}</InputLabel>
              <StyledInput
                maxLength={255}
                placeholder='1234 5678 8765 4321'
                onBlur={() => setDirtyField('creditCardNumber')}
                onChange={onChange}
                // ref={ref}
                id='card-number'
                name={'creditCardNumber'}
                type='text'
                autoComplete='cc-number'
              />
              <InputWrapper>
                <InputBlock>
                  <InputLabel>{'Expiry Date'}</InputLabel>
                  <StyledInput
                    maxLength={16}
                    placeholder='MM/YY'
                    // ref={ref}
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
                    maxLength={4}
                    placeholder='123'
                    // ref={ref}
                    onBlur={() => setDirtyField('cvc')}
                    onChange={onChange}
                    id='cvv'
                    name={'cvc'}
                    type='text'
                    autoComplete='cc-csc'
                  />
                </InputBlock>
              </InputWrapper>
              <CreditCardErrorLine
                stripeClientManager={stripeClientManager}
                fields={fields as any}
                // serverError={error ? error.message : undefined}
              />
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
