import React from 'react'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from 'universal/styles/email'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

const linkStyle = {
  ...emailLinkStyle,
  fontWeight: 600
}

export interface UpcomingInvoiceEmailProps {
  memberUrl: string
  periodEndStr: string
  newUsers: Array<{email: string; name: string}>
}

const UpcomingInvoiceEmail = (props: UpcomingInvoiceEmailProps) => {
  const {periodEndStr, newUsers, memberUrl} = props
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header />
        <p style={emailCopyStyle}>{'Hello, '}</p>
        <p style={emailCopyStyle}>
          {`Your teams have added the following users to your organization for the billing cycle ending on ${periodEndStr}.`}
        </p>
        {newUsers.map((newUser) => (
          <p key={newUser.email}>{`${newUser.name} (${newUser.email})`}</p>
        ))}
        <p>{`If any of these users were added in error, simply remove them here: ${memberUrl}`}</p>
        <p style={emailCopyStyle}>
          {'Get in touch if we can help in any way,'}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={linkStyle} title='love@parabol.co'>
            {'love@parabol.co'}
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

export default UpcomingInvoiceEmail
