import chunkArray from '../../client/utils/chunkArray'
import createEmbeddedImages from './createEmbeddedImages'
import mailgun from './provider/mailgun/mailgunDriver'
import googleMail from './provider/google/googleDriver'
import templates from './templates'
import {getGlobalConfig} from './provider/getGlobalConfig'

const MAX_BATCH_SIZE = getGlobalConfig().maxBatchSize
const mailFrom = getGlobalConfig().from

const mailProvider= mailgun || googleMail || undefined

//----------- Email

interface EmailContent {
  subject: string
  body: string
  html: string
}

export const sendEmailContent = (
  maybeEmailAddresses: string | string[],
  emailContent: EmailContent,
  tags: string[]
) => {
  const emailAddresses = Array.isArray(maybeEmailAddresses)
    ? maybeEmailAddresses
    : [maybeEmailAddresses]
  const to = emailAddresses.join(', ')
  return sendEmail(to, emailContent, tags)
}

export default async function sendEmailPromise(
  to: unknown,
  template: string,
  props: any,
  tags: string[]
) {
  if (!to || typeof to !== 'string') {
    throw new Error('Expected `to` to be a string of comma-separated emails')
  }
  const emailFactory = templates[template]
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`)
  }

  const emailContent = emailFactory(props)
  return sendEmail(to, emailContent, tags)
}

const sendEmail  = async (to: string, emailContent: EmailContent, tags: string[]) => {
  const {subject, body, html} = emailContent
  if (mailProvider)
    return await mailProvider.sendEmail({
      from: mailFrom,
      to,
      subject,
      text: body,
      html,
      'o:tag': tags
    }) 
  else {
    console.warn(`mail: no Mail Provider configured, so not sending the following:
    From: ${mailFrom}
    To: ${to}
    Subject: ${subject}
    Body: ${body}`)
    return true
  }
}

//----------- Batch Email

const getEmailFactory = (template) => {
  const emailFactory = templates[template]
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`)
  }
  return emailFactory
}

const makeMailApiData = (recipients: string | string[], template: string, props: any) => {
  const to = typeof recipients === 'string' ? recipients : recipients.join(',')
  const from = mailFrom
  const emailFactory = getEmailFactory(template)
  const {subject, body, html: htmlWithoutImages} = emailFactory(props)
  const {html, attachments} = createEmbeddedImages(htmlWithoutImages)
  return {
    from,
    to,
    subject,
    body,
    html,
    attachments
  }
}

export function sendBatchEmail(recipients, template, props, recipientVariables) {
  if (!Array.isArray(recipients)) {
    throw new Error('`recipients` must be an Array')
  }
  if (recipients.length > MAX_BATCH_SIZE) {
    const chunkedRecipients = chunkArray(recipients, MAX_BATCH_SIZE)
    console.warn(
      `Email for template ${template} exceeded mailgun maximum batch size of ${MAX_BATCH_SIZE} ` +
        `with ${recipients.length} requested recipients.  ` +
        `Sending ${chunkedRecipients.length} mailgun requests of up to ${MAX_BATCH_SIZE} recipients each.`
    )
    return Promise.all(
      chunkedRecipients.map((chunk) => sendBatchEmail(chunk, template, props, recipientVariables))
    )
  }
  if (mailProvider) {
    const mailApiData = makeMailApiData(recipients, template, props)
    if (recipientVariables) {
      mailApiData['recipient-variables'] = JSON.stringify(recipientVariables)
    }
    return (mailProvider) => mailProvider.sendEmail(mailApiData)
  }
  else {
    console.warn('mail: no Mail Provider configured, so not sending Batch Email')
    return true
  }
}

