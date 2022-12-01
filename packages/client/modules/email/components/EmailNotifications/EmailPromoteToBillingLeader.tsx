import graphql from 'babel-plugin-relay/macro'
import {EmailPromoteToBillingLeader_notification$key} from 'parabol-client/__generated__/EmailPromoteToBillingLeader_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import makeAppURL from '../../../../utils/makeAppURL'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailNotificationTemplate from './EmailNotificationTemplate'
interface Props {
  notificationRef: EmailPromoteToBillingLeader_notification$key
  appOrigin: string
}

const EmailPromoteToBillingLeader = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailPromoteToBillingLeader_notification on NotifyPromoteToOrgLeader {
        ...EmailNotificationTemplate_notification
        id
        organization {
          id
          name
        }
      }
    `,
    notificationRef
  )
  const {organization} = notification
  const {name: orgName, id: orgId} = organization

  const linkUrl = makeAppURL(appOrigin, `/me/organizations/${orgId}`, {
    searchParams: notificationSummaryUrlParams
  })

  return (
    <EmailNotificationTemplate
      message={`You‘ve been promoted to billing leader for ${orgName}`}
      notificationRef={notification}
      linkLabel='See organization'
      linkUrl={linkUrl}
    />
  )
}

export default EmailPromoteToBillingLeader
