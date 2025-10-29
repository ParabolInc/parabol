import nodemailer from 'nodemailer'
import {isNotNull} from '../../client/utils/predicates'
import logError from '../utils/logError'
import MailManager, {type MailManagerOptions} from './MailManager'

const composeConfig = () => {
  const {
    MAIL_SMTP_URL,
    MAIL_SMTP_HOST,
    MAIL_SMTP_PORT,
    MAIL_SMTP_USER,
    MAIL_SMTP_PASSWORD,
    MAIL_SMTP_USE_TLS,
    MAIL_SMTP_CIPHERS
  } = process.env
  if (MAIL_SMTP_URL) {
    const oldVars = [
      MAIL_SMTP_HOST,
      MAIL_SMTP_PORT,
      MAIL_SMTP_USER,
      MAIL_SMTP_PASSWORD,
      MAIL_SMTP_USE_TLS,
      MAIL_SMTP_CIPHERS
    ]
    const usedOldVars = oldVars.filter(isNotNull)
    if (usedOldVars.length > 0) {
      console.warn(
        `Using MAIL_SMTP_URL. The following ENV Vars are ignored and can be removed: ${usedOldVars.join(', ')}`
      )
    }
    return MAIL_SMTP_URL
  }
  return {
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
  }
}

if (process.env.MAIL_SMTP_DEBUG === 'true') {
  const verifyTransport = async () => {
    const manager = new MailManagerSMTP()
    try {
      await manager.transport.verify()
      console.log('SMTP Verification Complete. You may safely remove ENV Var MAIL_SMTP_DEBUG')
    } catch (err) {
      console.error('SMTP Verification Failed', err)
    }
  }
  verifyTransport()
}

export default class MailManagerSMTP extends MailManager {
  transport = nodemailer.createTransport(composeConfig())

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
      logError(error, {
        tags: {to: JSON.stringify(to)}
      })
      return false
    }
    return true
  }
}
