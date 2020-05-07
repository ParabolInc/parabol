import PropTypes from 'prop-types'
import React from 'react'
import makeAppLink from '../../../utils/makeAppLink'
import {emailCopyStyle, emailLinkStyle} from '../../styles'
import Button from '../Button'
import EmailBlock from '../EmailBlock/EmailBlock'
import EmailFooter from '../EmailFooter/EmailFooter'
import EmptySpace from '../EmptySpace/EmptySpace'
import Header from '../Header/Header'
import Layout from '../Layout/Layout'

const innerMaxWidth = 480

const copyStyle = {
  ...emailCopyStyle
}

const linkStyle = {
  ...emailCopyStyle,
  ...emailLinkStyle
}

const dashUrl = makeAppLink('me')
const tasksUrl = makeAppLink('me/tasks')

export default function NotificationSummaryEmail() {
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header />
        <p style={copyStyle}>
          {'Hi '}%recipient.name%{' -'}
        </p>
        <p style={copyStyle}>
          {'A friendly nudge, in case you missed it:'}
          <span style={{fontWeight: 600}}>
            {'you have '}
            %recipient.numNotifications%
            {' unread notification(s)'}
          </span>
          {' — '}
          <a style={linkStyle} href={dashUrl}>
            {'see what your team needs'}
          </a>
          {'.'}
        </p>
        <Button url={dashUrl}>{'Open Parabol'}</Button>
        <EmptySpace height={24} />
        <p style={copyStyle}>
          {'You can also see '}
          <a style={linkStyle} href={tasksUrl}>
            {'everything on your plate in the Tasks view'}
          </a>
          {'.'}
        </p>
        <p style={copyStyle}>
          {'If you need anything from us, don’t hesitate to reach out at '}
          <a style={linkStyle} href='mailto:love@parabol.co'>
            {'love@parabol.co'}
          </a>
          {'.'}
        </p>
        <p style={copyStyle}>
          {'Have fun & do great work,'}
          <br />
          {'- '}
          <a style={linkStyle} href='https://www.parabol.co/team'>
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

NotificationSummaryEmail.propTypes = {
  date: PropTypes.instanceOf(Date)
}
