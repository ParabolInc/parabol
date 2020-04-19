import {PALETTE} from 'parabol-client/lib/styles/paletteV2'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import makeAppLink from '../../utils/makeAppLink'
import emailTemplate from '../emailTemplate'
import EmailVerificationEmail from './EmailVerificationEmail'

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
