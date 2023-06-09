import styled from '@emotion/styled'
import {PaymentDetails_organization$key} from '../../../../__generated__/PaymentDetails_organization.graphql'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Divider} from '@mui/material'
import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import React, {useEffect} from 'react'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import CreateSetupIntentMutation from '../../../../mutations/CreateSetupIntentMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {ElementWidth} from '../../../../types/constEnums'
import BillingForm from './BillingForm'
import {MONTHLY_PRICE} from '../../../../utils/constants'

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
  overflow: 'hidden'
})

const Title = styled('h6')({
  color: PALETTE.SLATE_800,
  fontSize: 22,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  display: 'flex',
  margin: 0,
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

const stripePromise = loadStripe(window.__ACTION__.stripe)

type Props = {
  organizationRef: PaymentDetails_organization$key
}

const PaymentDetails = (props: Props) => {
  const {organizationRef} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()

  const organization = useFragment(
    graphql`
      fragment PaymentDetails_organization on Organization {
        id
        orgUserCount {
          activeUserCount
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, orgUserCount} = organization
  const {activeUserCount} = orgUserCount
  const price = activeUserCount * MONTHLY_PRICE

  useEffect(() => {
    CreateSetupIntentMutation(atmosphere, {orgId}, {onError, onCompleted})
  }, [])

  return (
    <StyledPanel label='Credit Card'>
      <StyledRow className={'flex-col-reverse md:flex-row'}>
        <Plan className={'w-full md:w-1/2'}>
          <Title>{'Credit Card Details'}</Title>
          <Content>
            <Elements stripe={stripePromise}>
              <BillingForm orgId={orgId} />
            </Elements>
          </Content>
        </Plan>
        <Plan className={'w-full md:w-1/2'}>
          <Title>{'Team Plan Pricing'}</Title>
          <Content>
            <InputLabel>{'Billing Cycle'}</InputLabel>
            <Subtitle>{'Monthly'}</Subtitle>
            <ActiveUserBlock>
              <InputLabel>{'Active Users'}</InputLabel>
              <InfoText>
                {'Active users are anyone who uses Parabol within a billing period'}
              </InfoText>
              <Subtitle>{activeUserCount}</Subtitle>
            </ActiveUserBlock>
            <Divider />
            <TotalBlock>
              <Subtitle>{'Total'}</Subtitle>
              <Subtitle>{`$${price.toFixed(2)}`}</Subtitle>
            </TotalBlock>
            <InfoText>{'All prices are in USD'}</InfoText>
          </Content>
        </Plan>
      </StyledRow>
    </StyledPanel>
  )
}

export default PaymentDetails
