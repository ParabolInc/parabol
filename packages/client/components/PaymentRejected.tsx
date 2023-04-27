import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useRouter from '../hooks/useRouter'
import {PaymentRejected_notification$key} from '../__generated__/PaymentRejected_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: PaymentRejected_notification$key
}
const PaymentRejected = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
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
    `,
    notificationRef
  )
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

export default PaymentRejected
