import makeAppLink from 'parabol-server/utils/makeAppLink'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {PALETTE} from '../../../styles/paletteV2'
import EmailVerificationEmail from './EmailVerificationEmail'
import emailTemplate from './SummaryEmail/MeetingSummaryEmail/EmailTemplate'

interface Props {
  verifiedEmailToken: string
  invitationToken: string | null | undefined
}

const emailVerificationEmailCreator = (props: Props) => {
  const {invitationToken, verifiedEmailToken} = props
  const fullToken = invitationToken
    ? `${verifiedEmailToken}/${invitationToken}`
    : verifiedEmailToken
  const verificationURL = makeAppLink(`verify-email/${fullToken}`)
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <EmailVerificationEmail verificationURL={verificationURL} />
  )

  const subject = `Verify your email address`
  const html = emailTemplate({
    bodyContent,
    title: subject,
    previewText: subject,
    bgColor: PALETTE.BACKGROUND_MAIN
  })

  return {
    subject,
    body: `Verification complete! Just go here: ${verificationURL}`,
    html
  }
}

export default emailVerificationEmailCreator
