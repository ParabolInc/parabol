import MailManager, {MailManagerOptions} from './MailManager'
import fs from 'fs'

export default class MailManagerDebug extends MailManager {
  async sendEmail(options: MailManagerOptions) {
    const {to, subject, body} = options
    console.warn(`SENDING EMAIL
    To: ${to}
    Subject: ${subject}
    Body: ${body}`)

    const {html} = options
    const filename = `/tmp/${to}-${subject.replaceAll(' ', '-')}.html`
    fs.writeFileSync(filename, html)
    console.warn(`Wrote email to ${filename}`)
    return true
  }
}
