import {ContactInfo, ExternalLinks} from 'parabol-client/types/constEnums'
import plural from 'parabol-client/utils/plural'
import {EmailNotificationPicker_notification$key} from 'parabol-client/__generated__/EmailNotificationPicker_notification.graphql'
import React from 'react'
import {EMAIL_CORS_OPTIONS} from '../../../types/cors'
import makeAppURL from '../../../utils/makeAppURL'
import {emailCopyStyle, emailLinkStyle} from '../styles'
import Button from './Button'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmailNotificationPicker from './EmailNotifications/EmailNotificationPicker'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

const copyStyle = {
  ...emailCopyStyle
}

export const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle
}

export const notificationSummaryUrlParams = {
  utm_source: 'notification email',
  utm_medium: 'email',
  utm_campaign: 'notifications',
  openNotifs: '1'
}

export interface NotificationSummaryProps {
  appOrigin: string
  preferredName: string
  notificationCount: number
  notificationRefs: EmailNotificationPicker_notification$key[]
}

export default function NotificationSummaryEmail(props: NotificationSummaryProps) {
  const {appOrigin, notificationCount, preferredName, notificationRefs} = props
  const additionalNotifications = notificationCount - notificationRefs.length
  const tasksURL = makeAppURL(appOrigin, 'me/tasks', {searchParams: notificationSummaryUrlParams})
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header align='center' appOrigin={appOrigin} corsOptions={EMAIL_CORS_OPTIONS} />
        <p
          style={{...copyStyle, textAlign: 'center', marginBottom: '0px'}}
        >{`Hi ${preferredName} 👋`}</p>
        <p style={{...copyStyle, textAlign: 'center'}}>
          {'You have '}
          <span style={{fontWeight: 600}}>
            {`${notificationCount} new ${plural(notificationCount, 'notification')}`}
          </span>
          {' from Parabol.'}
        </p>
        {notificationRefs.map((notificationRef, i) => {
          return (
            <EmailNotificationPicker
              key={i}
              appOrigin={appOrigin}
              notificationRef={notificationRef}
            />
          )
        })}
        <Button url={tasksURL}>
          {additionalNotifications > 0 && notificationRefs.length > 0
            ? `...and ${additionalNotifications} more`
            : 'See all notifications'}
        </Button>
        <EmptySpace height={24} />
        <p style={copyStyle}>
          {'If you need anything from us, don’t hesitate to reach out at '}
          <a style={linkStyle} href={`mailto:${ContactInfo.EMAIL_LOVE}`}>
            {ContactInfo.EMAIL_LOVE}
          </a>
          {'.'}
        </p>
        <p style={copyStyle}>
          {'Have fun & do great work,'}
          <br />
          {'- '}
          <a style={linkStyle} href={ExternalLinks.TEAM}>
            {'Parabol Team'}
          </a>
        </p>
        <EmptySpace height={16} />
      </EmailBlock>
      <EmailBlock hasBackgroundColor innerMaxWidth={innerMaxWidth}>
        <EmailFooter />
      </EmailBlock>
    </Layout>
  )
}
