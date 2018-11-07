import PropTypes from 'prop-types'
import React from 'react'
import makeAppLink from 'server/utils/makeAppLink'
import EmailBlock from '../EmailBlock/EmailBlock'
import Button from '../Button/Button'
import Header from '../Header/Header'
import Layout from '../Layout/Layout'
import {emailCopyStyle, emailLinkStyle} from 'universal/styles/email'

const copyStyle = {
  ...emailCopyStyle
}

const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle,
  fontWeight: 600
}

const notificationPageUrl = makeAppLink('me/notifications')

export default function NotificationSummaryEmail () {
  return (
    <Layout>
      <EmailBlock>
        <Header imgProvider='hubspot' />
        <p style={copyStyle}>
          {'Hi there, '}%recipient.name%{'!'}
        </p>
        <p style={copyStyle}>
          {'You have received '}
          <span style={{fontWeight: 600}}>
            %recipient.numNotifications%{' new notification(s)'}
          </span>
          {' in the last day.'}
        </p>
        <Button url={notificationPageUrl}>{'See My Notifications'}</Button>
        <p style={copyStyle}>{'This is just a friendly, automated nudge!'}</p>
        <p style={copyStyle}>{'Your teammates need you!'}</p>
        <p style={copyStyle}>{'The product team @Parabol 🙉 🙈 🙊'}</p>
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
      </EmailBlock>
    </Layout>
  )
}

NotificationSummaryEmail.propTypes = {
  date: PropTypes.instanceOf(Date)
}
