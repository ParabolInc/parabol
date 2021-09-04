import Mailgun from 'mailgun.js'
import FormData from 'form-data'
import sendToSentry from '../utils/sendToSentry'
import MailManager, {MailManagerOptions} from './MailManager'

export default class MailManagerMailgun extends MailManager {
  mailgun = new Mailgun(FormData);
  mailgunClient = this.mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || ''
  });
  async sendEmail(options: MailManagerOptions) {
    const {subject, body, to, attachments, html, tags} = options
    const toArr = Array.isArray(to) ? to : [to]
    const toStr = toArr.join(',')
    try {
      await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
        to: toStr,
        from: process.env.MAIL_FROM,
        subject,
        html,
        body,
        attachments,
        'o:tag': tags
      })
    } catch (e) {
      sendToSentry(new Error(`Mailgun error: ${e.message}`), {tags: {to: toStr}})
      return false
    }
    return true
  }
}
