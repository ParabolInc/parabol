import FormData from 'form-data'
import fs from 'fs'
import Mailgun, {type ValidationResult} from 'mailgun.js'
import mime from 'mime-types'
import logError from '../utils/logError'
import MailManager, {
  type Attachment,
  type EmailValidation,
  type MailManagerOptions
} from './MailManager'

// The v4 API also returns a typo suggestion that mailgun.js does not type
interface MailgunValidationResult extends ValidationResult {
  did_you_mean?: string | null
}

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

  async validateEmail(email: string): Promise<EmailValidation> {
    let res: MailgunValidationResult
    try {
      res = await this.mailgunClient.validate.get(email)
    } catch (e) {
      // Fail open: an outage of the validation API must not block every invitation
      const error = e instanceof Error ? e : new Error('Mailgun failed to validate emails')
      logError(error, {tags: {type: 'Mailgun error'}})
      return {result: 'unknown'}
    }
    const didYouMean = res.did_you_mean ?? undefined
    if (res.result === 'deliverable' || res.result === 'catch_all') {
      return {result: 'deliverable', didYouMean}
    }
    if (res.result === 'undeliverable' || res.result === 'do_not_send') {
      return {result: 'undeliverable', didYouMean}
    }
    return {result: 'unknown', didYouMean}
  }
}
