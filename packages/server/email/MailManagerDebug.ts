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
    // limit filename length so it does not exceed filesystem limits
    const filename = `${to.slice(0, 50)}-${subject.replaceAll(' ', '-').slice(0, 180)}.html`
    const folder = '/tmp'
    fs.writeFileSync(`${folder}/${filename}`, html)
    // make it a link so you can click it in the terminal
    console.warn(`Wrote email to file://${folder}/${encodeURIComponent(filename)}`)
    return true
  }
}
