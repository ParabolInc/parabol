import React from 'react'
import {useTranslation} from 'react-i18next'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../styles'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

interface ResetPasswordEmailProps {
  verificationURL: string
  appOrigin: string
}

const EmailVerificationEmail = (props: ResetPasswordEmailProps) => {
  const {appOrigin, verificationURL} = props

  const {t} = useTranslation()

  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header appOrigin={appOrigin} />
        <p style={emailCopyStyle}>{t('EmailVerificationEmail.Hello👋')}</p>
        <p style={emailCopyStyle}>{t('EmailVerificationEmail.TapTheLinkBelowToVerifyYourEmail')}</p>
        <p style={emailCopyStyle}>
          <a
            href={verificationURL}
            style={emailLinkStyle}
            title={t('EmailVerificationEmail.VerifyMyEmail')}
          >
            {t('EmailVerificationEmail.VerifyMyEmail')}
          </a>
        </p>
        <p style={emailCopyStyle}>
          {t('EmailVerificationEmail.GetInTouchIfWeCanHelpInAnyWay')}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={emailLinkStyle} title='love@parabol.co'>
            {t('EmailVerificationEmail.LoveParabolCo')}
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
