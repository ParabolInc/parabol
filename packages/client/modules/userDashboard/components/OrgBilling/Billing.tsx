import styled from '@emotion/styled'
import {Divider} from '@mui/material'
import React, {useEffect, useState} from 'react'
import BillingForm from './BillingForm'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {PALETTE} from '../../../../styles/paletteV3'
import {loadStripe} from '@stripe/stripe-js'
import {Elements} from '@stripe/react-stripe-js'
import CreatePaymentIntentMutation from '../../../../mutations/CreatePaymentIntentMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {CreatePaymentIntentMutationResponse} from '../../../../__generated__/CreatePaymentIntentMutation.graphql'
import {CompletedHandler} from '../../../../types/relayMutations'
import {ElementWidth} from '../../../../types/constEnums'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
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

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 22,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  display: 'flex',
  width: '100%',
  padding: '8px 0px 16px 0px'
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

const TotalBlock = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: 16
})

const ActiveUserBlock = styled('div')({
  paddingTop: 16
})

const stripeAppearanceSettings = {
  theme: 'stripe',
  rules: {
    '.Input': {
      border: 'none',
      borderBottom: `1px solid ${PALETTE.SLATE_400}`
    }
  },
  variables: {
    colorBackground: PALETTE.SLATE_200,
    border: 'none',
    borderBottom: `1px solid ${PALETTE.SLATE_400}`,
    color: PALETTE.SLATE_800,
    fontSize: 16,
    marginBottom: 16,
    padding: '12px 16px',
    outline: 0
  }
} as const

const stripeFonts = [
  {
    family: 'IBM Plex Sans',
    src: `url('/static/fonts/IBMPlexSans-Regular.woff2') format('woff2')`,
    weight: '400'
  }
]

const stripePromise = loadStripe(window.__ACTION__.stripe)

const Billing = () => {
  const [clientSecret, setClientSecret] = useState('')
  const atmosphere = useAtmosphere()
  const {onError} = useMutationProps()

  useEffect(() => {
    const handleCompleted: CompletedHandler<CreatePaymentIntentMutationResponse> = (res) => {
      const {createPaymentIntent} = res
      const {clientSecret} = createPaymentIntent
      if (clientSecret) {
        setClientSecret(clientSecret)
      }
    }

    CreatePaymentIntentMutation(atmosphere, {}, {onError, onCompleted: handleCompleted})
  }, [])

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
        <Plan>
          <Title>{'Credit Card Details'}</Title>
          <Content>
            <Elements
              options={{
                clientSecret,
                appearance: stripeAppearanceSettings,
                loader: 'never' as const,
                fonts: stripeFonts
              }}
              stripe={stripePromise}
            >
              <BillingForm />
            </Elements>
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
