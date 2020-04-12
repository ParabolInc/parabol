import PropTypes from 'prop-types'
import React from 'react'
import makeAppLink from 'parabol-server/src/utils/makeAppLink'
import EmailBlock from '../EmailBlock/EmailBlock'
import EmptySpace from '../EmptySpace/EmptySpace'
import Button from '../Button/Button'
import Header from '../Header/Header'
import Layout from '../Layout/Layout'
import EmailFooter from '../EmailFooter/EmailFooter'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../../../../styles/email'

const innerMaxWidth = 480

const copyStyle = {
  ...emailCopyStyle
}

const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle
}

const notificationPageUrl = makeAppLink('me')

export default function NotificationSummaryEmail() {
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header />
        <p style={copyStyle}>
          {'Hi '}%recipient.name%{','}
        </p>
        <p style={copyStyle}>
          {'You have received '}
          <span style={{fontWeight: 600}}>
            %recipient.numNotifications%{' new notification(s)'}
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
