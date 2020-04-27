import Mailgun from 'mailgun-js'
import {getMailgunApiConfig} from './getMailgunConfig'
import {getGlobalConfig} from './../getGlobalConfig'
import sendToSentry from '../../../utils/sendToSentry'

const config = getMailgunApiConfig()
const mailgun = (getGlobalConfig().provider == 'mailgun') ? new Mailgun(config) : undefined

if (mailgun) {
  mailgun.sendEmail = function (mailOptions) {
    try {
      return mailgun.messages().send(mailOptions)
    } catch (e) {
      console.log(e)
      sendToSentry(new Error(`Error sending email: ${e.message}`), {tags: {to}})
      return false
    }
  }
}
export default mailgun
