import graphql from 'babel-plugin-relay/macro'
import {EmailNotificationTemplate_notification$key} from 'parabol-client/__generated__/EmailNotificationTemplate_notification.graphql'
import React, {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../../../../styles/paletteV3'
import relativeDate from '../../../../utils/date/relativeDate'
import {linkStyle} from '../NotificationSummaryEmail'

const notificationBodyStyle = {paddingTop: 8, paddingBottom: 8} as React.CSSProperties

const rowStyle: React.CSSProperties = {
  background: '#fff',
  cursor: 'default',
  display: 'flex',
  width: '400px',
  paddingBottom: 9
}

const messageStyle: React.CSSProperties = {
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '20px'
}

const avatarStyles: React.CSSProperties = {
  background: '#fff',
  borderRadius: '100%',
  minWidth: 40,
  margin: 12
}

interface Props {
  avatar?: string
  message: string
  notificationRef: EmailNotificationTemplate_notification$key
  linkLabel?: string
  linkUrl?: string
  children?: ReactNode
}

const EmailNotificationTemplate = (props: Props) => {
  const {avatar, message, notificationRef, linkLabel, linkUrl, children} = props
  const notification = useFragment(
    graphql`
      fragment EmailNotificationTemplate_notification on Notification {
        createdAt
        status
      }
    `,
    notificationRef
  )

  const {createdAt} = notification
  return (
    <div style={rowStyle}>
      {avatar ? (
        <img height='40' width='40' style={avatarStyles} src={avatar} />
      ) : (
        <div style={avatarStyles} />
      )}
      <div style={notificationBodyStyle}>
        <div style={messageStyle}>{message}</div>
        <div style={{display: 'flex', fontSize: 14, lineHeight: '20px'}}>
          <div style={{color: PALETTE.SLATE_600}}>{relativeDate(createdAt)}</div>
          {linkLabel && linkUrl && (
            <a style={{...linkStyle, paddingLeft: 8, fontSize: 14, margin: '0px'}} href={linkUrl}>
              {linkLabel}
            </a>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export default EmailNotificationTemplate
