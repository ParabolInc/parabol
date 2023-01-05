import graphql from 'babel-plugin-relay/macro'
import {EmailPaymentRejected_notification$key} from 'parabol-client/__generated__/EmailPaymentRejected_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import makeAppURL from '../../../../utils/makeAppURL'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailNotificationTemplate from './EmailNotificationTemplate'

interface Props {
  notificationRef: EmailPaymentRejected_notification$key
  appOrigin: string
}
const EmailPaymentRejected = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailPaymentRejected_notification on NotifyPaymentRejected {
        ...EmailNotificationTemplate_notification
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
  const {organization} = notification
  const {id: orgId, creditCard} = organization
  const {last4, brand} = creditCard || {last4: '****', brand: 'Unknown'}

  const linkUrl = makeAppURL(appOrigin, `/me/organizations/${orgId}`, {
    searchParams: notificationSummaryUrlParams
  })

  return (
    <EmailNotificationTemplate
      message={`Your ${brand} card ending in ${last4} was rejected`}
      notificationRef={notification}
      linkLabel={'Updated billing information'}
      linkUrl={linkUrl}
    />
  )
}

export default EmailPaymentRejected
