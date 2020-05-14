import {PALETTE} from 'parabol-client/styles/paletteV2'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import makeAppLink from '../utils/makeAppLink'
import ResetPasswordEmail from './components/ResetPasswordEmail'
import emailTemplate from './emailTemplate'

interface Props {
  resetPasswordToken: string
}

const resetPasswordEmailCreator = (props: Props) => {
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
