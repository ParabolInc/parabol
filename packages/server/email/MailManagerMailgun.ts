import Mailgun from 'mailgun-js'
import sendToSentry from '../utils/sendToSentry'
import MailManager, {MailManagerOptions} from './MailManager'

export default class MailManagerMailgun extends MailManager {
  mailgun = new Mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN})
  async sendEmail(options: MailManagerOptions) {
    const {subject, body, to, attachments, html, tags} = options
    const toArr = Array.isArray(to) ? to : [to]
    const toStr = toArr.join(',')
    try {
      await this.mailgun.messages().send({
        to: toStr,
        from: process.env.MAIL_FROM,
        subject,
        html,
        body,
        attachments,
        'o:tag': tags
      })
    } catch (e) {
      sendToSentry(e, {tags: {to: toStr, type: 'Mailgun error'}})
      return false
    }
    return true
  }
}
