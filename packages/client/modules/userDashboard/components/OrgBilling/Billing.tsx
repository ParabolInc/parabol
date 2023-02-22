import styled from '@emotion/styled'
import React from 'react'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {PALETTE} from '../../../../styles/paletteV3'

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

const NewIssueInput = styled('input')({
  appearance: 'none',
  background: PALETTE.SLATE_200,
  border: 'none',
  borderBottom: `1px solid ${PALETTE.GRAPE_700}`,
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
              <NewIssueInput
                autoFocus
                // onBlur={handleCreateNewIssue}
                // onChange={onChange}
                maxLength={255}
                placeholder='Full Name'
                // ref={ref}
                id='cardholder-name'
                name='cardholderName'
                type='text'
                autoComplete='cc-name'
              />
              <InputLabel>{'Card Number'}</InputLabel>
              <NewIssueInput
                autoFocus
                // onBlur={handleCreateNewIssue}
                // onChange={onChange}
                maxLength={255}
                placeholder='1234 5678 8765 4321'
                // ref={ref}
                id='card-number'
                name='cardNumber'
                type='text'
                autoComplete='cc-number'
              />
              <InputWrapper>
                <InputBlock>
                  <InputLabel>{'Expiry Date'}</InputLabel>
                  <NewIssueInput
                    autoFocus
                    // onBlur={handleCreateNewIssue}
                    // onChange={onChange}
                    maxLength={16}
                    placeholder='MM/YY'
                    // ref={ref}
                    id='expiry'
                    name='expiry'
                    type='text'
                    autoComplete='cc-exp'
                  />
                </InputBlock>
                <InputBlock>
                  <InputLabel>{'CVV'}</InputLabel>
                  <NewIssueInput
                    autoFocus
                    // onBlur={handleCreateNewIssue}
                    // onChange={onChange}
                    maxLength={4}
                    placeholder='123'
                    // ref={ref}
                    id='cvv'
                    name='cvv'
                    type='text'
                    autoComplete='cc-csc'
                  />
                </InputBlock>
              </InputWrapper>
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
