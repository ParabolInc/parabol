import fs from 'fs'
import {Logger} from '../utils/Logger'
import MailManager, {MailManagerOptions} from './MailManager'

export default class MailManagerDebug extends MailManager {
  async sendEmail(options: MailManagerOptions) {
    const {to, subject, body} = options
    Logger.warn(`SENDING EMAIL
    To: ${to}
    Subject: ${subject}
    Body: ${body}`)

    const toStr = to.toString()

    const {html} = options
    // limit filename length so it does not exceed filesystem limits
    const filename = `${toStr.slice(0, 50)}-${subject.replaceAll(' ', '-').slice(0, 180)}.html`
    const folder = '/tmp'
    fs.writeFileSync(`${folder}/${filename}`, html)
    // make it a link so you can click it in the terminal
    Logger.warn(`Wrote email to file://${folder}/${encodeURIComponent(filename)}`)
    return true
  }
}
