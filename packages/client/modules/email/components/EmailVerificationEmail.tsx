import React from 'react'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../../../styles/email'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

interface ResetPasswordEmailProps {
  verificationURL: string
}

const EmailVerificationEmail = (props: ResetPasswordEmailProps) => {
  const {verificationURL} = props
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header />
        <p style={emailCopyStyle}>{'Verification Complete!'}</p>
        <p style={emailCopyStyle}>{`Just click the link below.`}</p>
        <p style={emailCopyStyle}>
          <a href={verificationURL} style={emailLinkStyle} title='Verify Email'>
            {'Verify Email'}
          </a>
        </p>
        <p style={emailCopyStyle}>
          {'Get in touch if we can help in any way,'}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={emailLinkStyle} title='love@parabol.co'>
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

export default EmailVerificationEmail
