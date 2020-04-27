import nodemailer from 'nodemailer'
import {getGoogleApiConfig} from './getGoogleConfig'
import {getGlobalConfig} from './../getGlobalConfig'
import sendToSentry from '../../../utils/sendToSentry'

const config = getGoogleApiConfig()
const mailGoogle = (getGlobalConfig().provider == 'google')? new nodemailer.createTransport({
  service: 'gmail',
  auth: {
         user: config.user,
         pass: config.pass
     }
 }): undefined

if (mailGoogle) {
  mailGoogle.sendEmail = function (mailOptions) {
    try {
      return mailGoogle.sendMail(mailOptions)
    } catch (e) {
      console.log(e)
      sendToSentry(new Error(`Error sending email: ${e.message}`), {tags: {to}})
      return false
    }
  }
}

export default mailGoogle

