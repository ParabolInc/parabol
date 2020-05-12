import nodemailer from 'nodemailer'
import sendToSentry from '../utils/sendToSentry'
import MailManager, {MailManagerOptions} from './MailManager'

export default class MailManagerGoogle extends MailManager {
  transport = new nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_GOOGLE_USER,
      pass: process.env.MAIL_GOOGLE_PASS
    }
  })

  async sendEmail(options: MailManagerOptions) {
    const {subject, body, to, attachments, html} = options
    try {
      await this.transport.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        text: body,
        html,
        attachments
      })
    } catch (e) {
      sendToSentry(new Error(`Google nodemailer error: ${e.message}`), {
        tags: {to: JSON.stringify(to)}
      })
      return false
    }
    return true
  }
}
