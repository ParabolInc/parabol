import graphql from 'babel-plugin-relay/macro'
import NotificationAction from 'components/NotificationAction'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useRouter from '../hooks/useRouter'
import {PaymentRejected_notification} from '../__generated__/PaymentRejected_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

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
    <NotificationTemplate
      message={`Your ${brand} card ending in ${last4} was rejected`}
      notification={notification}
      action={<NotificationAction label={'Updated billing information'} onClick={addBilling} />}
    />
  )
}

export default createFragmentContainer(PaymentRejected, {
  notification: graphql`
    fragment PaymentRejected_notification on NotifyPaymentRejected {
      ...NotificationTemplate_notification
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
