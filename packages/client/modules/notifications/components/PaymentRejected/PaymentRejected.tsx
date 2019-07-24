import styled from '@emotion/styled'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import ui from '../../../../styles/ui'
import Row from '../../../../components/Row/Row'
import IconAvatar from '../../../../components/IconAvatar/IconAvatar'
import RaisedButton from '../../../../components/RaisedButton'
import useRouter from '../../../../hooks/useRouter'
import {PaymentRejected_notification} from '../../../../__generated__/PaymentRejected_notification.graphql'
import NotificationMessage from '../NotificationMessage'

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})

const WidestButton = styled('div')({
  marginLeft: 16,
  minWidth: 176
})

interface Props {
  notification: PaymentRejected_notification
}
const PaymentRejected = (props: Props) => {
  const {notification} = props
  const {history} = useRouter()
  const {organization} = notification
  const {id: orgId, creditCard} = organization
  const {last4, brand} = creditCard || {last4: '****', brand: 'Unknown'}
  const addBilling = () => {
    history.push(`/me/organizations/${orgId}`)
  }
  return (
    <Row>
      <IconAvatar icon='credit_card' size='small' />
      <NotificationMessage>
        {'Your '}
        <b>{brand}</b>
        {' card ending in '}
        <b>{last4}</b>
        {' was rejected.'}
        <br />
        {'Call your card provider or head to the settings page to try a new card.'}
      </NotificationMessage>
      <WidestButton>
        <StyledButton
          aria-label='Go to the billing page to update billing information'
          size={'small'}
          onClick={addBilling}
          palette='warm'
        >
          {'See Billing'}
        </StyledButton>
      </WidestButton>
    </Row>
  )
}

export default createFragmentContainer(PaymentRejected, {
  notification: graphql`
    fragment PaymentRejected_notification on NotifyPaymentRejected {
      organization {
        id
        creditCard {
          last4
          brand
        }
      }
    }
  `
})
