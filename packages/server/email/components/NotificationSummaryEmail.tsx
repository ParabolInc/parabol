import plural from 'parabol-client/utils/plural'
import {ContactInfo, ExternalLinks} from 'parabol-client/types/constEnums'
import PropTypes from 'prop-types'
import React from 'react'
import makeAppLink from '../../utils/makeAppLink'
import {emailCopyStyle, emailLinkStyle} from '../styles'
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

const tasksUrl = makeAppLink('me/tasks')

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
        <p style={copyStyle}>{`Hi ${preferredName} -`}</p>
        <p style={copyStyle}>
          {'You have '}
          <span style={{fontWeight: 600}}>
            {`${notificationCount} new ${plural(notificationCount, 'notification')}`}
          </span>
          {' — see what’s changed with your teams.'}
        </p>
        <Button url={tasksUrl}>{'See My Dashboard'}</Button>
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

NotificationSummaryEmail.propTypes = {
  date: PropTypes.instanceOf(Date)
}
