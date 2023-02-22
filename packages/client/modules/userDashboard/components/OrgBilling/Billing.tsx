import styled from '@emotion/styled'
import React from 'react'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'

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
  padding: '16px 8px',
  height: 400,
  borderRadius: 4,
  border: `2px solid transparent`
})

const Heading = styled('span')<{isBold?: boolean}>(({isBold}) => ({
  fontWeight: isBold ? 600 : 400,
  fontSize: 16
}))

const HeadingBlock = styled('div')({
  padding: '8px'
})

const Content = styled('div')({})

const Billing = () => {
  return (
    <StyledPanel label='Plans'>
      <StyledRow>
        <HeadingBlock>
          <Heading>{'Your next payment is due on '}</Heading>
          <Heading isBold>{' November 17, 2023.'}</Heading>
        </HeadingBlock>
      </StyledRow>
      <StyledRow>
        <Plan>
          <Content></Content>
        </Plan>
      </StyledRow>
    </StyledPanel>
  )
}

export default Billing
