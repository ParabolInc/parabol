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
  appOrigin: string
  resetURL: string
}

const ResetPasswordEmail = (props: ResetPasswordEmailProps) => {
  const {appOrigin, resetURL} = props

  const {t} = useTranslation()

  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header appOrigin={appOrigin} />
        <p style={emailCopyStyle}>{t('ResetPasswordEmail.ForgetYourPassword')}</p>
        <p style={emailCopyStyle}>{t('ResetPasswordEmail.NoProblemJustClickTheLinkBelow', {})}</p>
        <p style={emailCopyStyle}>
          <a href={resetURL} style={emailLinkStyle} title={t('ResetPasswordEmail.ResetPassword')}>
            {t('ResetPasswordEmail.ResetPassword')}
          </a>
        </p>
        <p style={emailCopyStyle}>
          {t('ResetPasswordEmail.GetInTouchIfWeCanHelpInAnyWay')}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={emailLinkStyle} title='love@parabol.co'>
            {t('ResetPasswordEmail.LoveParabolCo')}
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

export default ResetPasswordEmail
