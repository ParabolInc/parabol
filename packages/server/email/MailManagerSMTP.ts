import nodemailer from 'nodemailer'
import {isNotNull} from '../../client/utils/predicates'
import logError from '../utils/logError'
import MailManager, {type MailManagerOptions} from './MailManager'

// Amazon SES has a 50 recipients limit, but it's safe to apply everywhere SMTP
// https://docs.aws.amazon.com/ses/latest/dg/quotas.html
const MAX_RECIPIENTS = 50

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

const batch = <T extends Array<any>>(arr: T, batchSize: number) => {
  const batches = Math.ceil(arr.length / batchSize)
  return [...new Array(batches)].map((_, i) => arr.slice(i * batchSize, i * batchSize + batchSize))
}

export default class MailManagerSMTP extends MailManager {
  transport = nodemailer.createTransport(composeConfig())

  async sendEmail(options: MailManagerOptions) {
    const {subject, body, to, attachments, html} = options
    // process in batches
    //
    const toList = Array.isArray(to) ? to : [to]

    const res = await Promise.allSettled(batch(toList, MAX_RECIPIENTS).map((to) =>
      this.transport.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        text: body,
        html,
        attachments
      })
    ))

    return res.reduce((success, value) => {
      if (value.status !== 'fulfilled') {
        const error = value.reason instanceof Error ? value.reason : new Error('SMTP nodemailer error')
        logError(error, {
          tags: {to: JSON.stringify(to)}
        })
        return false
      }
      return success
    }, true)
  }
}
