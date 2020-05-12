import plural from 'parabol-client/utils/plural'
import PropTypes from 'prop-types'
import React from 'react'
import makeAppLink from '../../utils/makeAppLink'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../styles'
import Button from './Button'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

const copyStyle = {
  ...emailCopyStyle
}

const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle
}

const notificationPageUrl = makeAppLink('me/tasks')

export interface NotificationSummaryProps {
  preferredName: string
  notificationCount: number
}
export default function NotificationSummaryEmail(props: NotificationSummaryProps) {
  const {notificationCount, preferredName} = props
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header />
        <p style={copyStyle}>{`Hi ${preferredName},`}</p>
        <p style={copyStyle}>
          {'You have received '}
          <span style={{fontWeight: 600}}>
            {`${notificationCount} new ${plural(notificationCount, 'notification')}`}
          </span>
          {' in the last day.'}
        </p>
        <Button url={notificationPageUrl}>{'See My Notifications'}</Button>
        <EmptySpace height={24} />
        <p style={copyStyle}>{'This is just a friendly, automated nudge!'}</p>
        <p style={copyStyle}>{'Your teammates need you!'}</p>
        <p style={copyStyle}>{emailProductTeamSignature}</p>
        <p style={copyStyle}>
          <b>{'P.S. We want to hear from you:'}</b>
        </p>
        <p style={copyStyle}>
          {'Email us at '}
          <a style={linkStyle} href='mailto:love@parabol.co'>
            {'love@parabol.co'}
          </a>
          {' with any feedback or questions you may have about our software.'}
        </p>
        <p style={copyStyle}>
          {'Or, schedule a video chat with our product team: '}
          <br />
          <a style={linkStyle} href='https://calendly.com/parabol/product/'>
            {'https://calendly.com/parabol/product/'}
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

NotificationSummaryEmail.propTypes = {
  date: PropTypes.instanceOf(Date)
}
