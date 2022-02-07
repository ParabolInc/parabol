import nodemailer from 'nodemailer'
import sendToSentry from '../utils/sendToSentry'
import MailManager, {MailManagerOptions} from './MailManager'

export default class MailManagerGoogle extends MailManager {
  transport = nodemailer.createTransport({
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
      const error = e instanceof Error ? e : new Error('Failed to sendMail')
      sendToSentry(error, {
        tags: {to: JSON.stringify(to), type: 'Google nodemailer error'}
      })
      return false
    }
    return true
  }
}
