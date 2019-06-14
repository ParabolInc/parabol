import styled, {css} from 'react-emotion'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import ui from 'universal/styles/ui'
import Row from 'universal/components/Row/Row'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import RaisedButton from 'universal/components/RaisedButton'
import useRouter from 'universal/hooks/useRouter'
import {PaymentRejected_notification} from '__generated__/PaymentRejected_notification.graphql'

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})

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
      <div className={css(defaultStyles.message)}>
        {'Your '}
        <b>{brand}</b>
        {' card ending in '}
        <b>{last4}</b>
        {' was rejected.'}
        <br />
        {'Call your card provider or head to the settings page to try a new card.'}
      </div>
      <div className={css(defaultStyles.widestButton)}>
        <StyledButton
          aria-label='Go to the billing page to update billing information'
          size={ui.notificationButtonSize}
          onClick={addBilling}
          palette='warm'
        >
          {'See Billing'}
        </StyledButton>
      </div>
    </Row>
  )
}

export default createFragmentContainer(
  PaymentRejected,
  graphql`
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
)
