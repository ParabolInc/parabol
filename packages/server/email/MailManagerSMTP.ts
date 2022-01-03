import nodemailer from 'nodemailer'
import sendToSentry from '../utils/sendToSentry'
import MailManager, {MailManagerOptions} from './MailManager'

export default class MailManagerSMTP extends MailManager {
  transport = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST,
    port: Number(process.env.MAIL_SMTP_PORT) || 0,
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
      const error = e instanceof Error ? e : new Error('SMTP nodemailer error')
      sendToSentry(error, {
        tags: {to: JSON.stringify(to)}
      })
      return false
    }
    return true
  }
}
