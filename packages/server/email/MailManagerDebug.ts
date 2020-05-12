import MailManager, {MailManagerOptions} from './MailManager'

export default class MailManagerDebug extends MailManager {
  async sendEmail(options: MailManagerOptions) {
    const {to, subject, body} = options
    console.warn(`SENDING EMAIL
    To: ${to}
    Subject: ${subject}
    Body: ${body}`)
    return true
  }
}
