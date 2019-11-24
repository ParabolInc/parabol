import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ResetPasswordEmail from './ResetPasswordEmail'
import makeAppLink from 'parabol-server/utils/makeAppLink'
import emailTemplate from './SummaryEmail/MeetingSummaryEmail/EmailTemplate'
import {PALETTE} from '../../../styles/paletteV2'

interface Props {
  resetPasswordToken: string
}

const resetPasswordEmailCreator = async (props: Props) => {
  const {resetPasswordToken} = props
  const resetURL = makeAppLink(`reset-password/${resetPasswordToken}`)
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <ResetPasswordEmail resetURL={resetURL} />
  )

  const subject = `Request to Reset Your Password`
  const html = emailTemplate({
    bodyContent,
    title: subject,
    previewText: subject,
    bgColor: PALETTE.BACKGROUND_MAIN
  })

  return {
    subject,
    body: `Forget your password? No problem, just go here: ${resetURL}`,
    html
  }
}

export default resetPasswordEmailCreator
