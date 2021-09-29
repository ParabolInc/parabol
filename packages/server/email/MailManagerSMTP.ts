import nodemailer from 'nodemailer'
import sendToSentry from '../utils/sendToSentry'
import MailManager, {MailManagerOptions} from './MailManager'

export default class MailManagerSMTP extends MailManager {
  transport = new nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST,
    port: process.env.MAIL_SMTP_PORT,
    auth: process.env.MAIL_SMTP_USER
      ? {
          user: process.env.MAIL_SMTP_USER,
          pass: process.env.MAIL_SMTP_PASSWORD
        }
      : undefined,
    secure: false,
    pool: true,
    maxConnections: 10,
    rateLimit: 50,
    tls:
      process.env.MAIL_SMTP_USE_TLS === '1'
        ? {
            rejectUnauthorized: false,
            ciphers: process.env.MAIL_SMTP_CIPHERS
          }
        : undefined
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
      sendToSentry(new Error(`SMTP nodemailer error: ${e.message}`), {
        tags: {to: JSON.stringify(to)}
      })
      return false
    }
    return true
  }
}
