import FormData from 'form-data'
import fs from 'fs'
import Mailgun from 'mailgun.js'
import mime from 'mime-types'
import logError from '../utils/logError'
import MailManager, {type Attachment, type MailManagerOptions} from './MailManager'

interface MailgunFile {
  filename: string
  data: Buffer
  contentType?: string
}

const toMailgunFile = async ({filename, path, cid}: Attachment): Promise<MailgunFile> => ({
  filename: cid ?? filename,
  data: await fs.promises.readFile(path),
  contentType: mime.lookup(filename) || undefined
})

const toMailgunFiles = async (attachments: Attachment[]) => {
  const inline = await Promise.all(attachments.filter((a) => a.cid).map(toMailgunFile))
  const attachment = await Promise.all(attachments.filter((a) => !a.cid).map(toMailgunFile))
  return {
    inline: inline.length ? inline : undefined,
    attachment: attachment.length ? attachment : undefined
  }
}

export default class MailManagerMailgun extends MailManager {
  mailgun = new Mailgun(FormData)
  mailgunClient = this.mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || ''
  })
  async sendEmail(options: MailManagerOptions) {
    const {subject, body, to, attachments, html, tags} = options
    const toArr = Array.isArray(to) ? to : [to]
    const toStr = toArr.join(',')
    try {
      const {attachment, inline} = await toMailgunFiles(attachments ?? [])
      await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN!, {
        to: toStr,
        from: process.env.MAIL_FROM,
        subject,
        html,
        text: body,
        attachment,
        inline,
        'o:tag': tags
      })
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Mailgun failed to create message')
      logError(error, {tags: {to: toStr, type: 'Mailgun error'}})
      return false
    }
    return true
  }

  async validateEmail(email: string) {
    try {
      const res = await this.mailgunClient.validate.get(email)
      return ['deliverable', 'catch_all', 'unknown'].includes(res.result)
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Mailgun failed to validate emails')
      logError(error, {tags: {type: 'Mailgun error'}})
      return false
    }
  }
}
