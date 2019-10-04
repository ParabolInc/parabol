import chunkArray from '../../client/utils/chunkArray'
import createEmbeddedImages from './createEmbeddedImages'
import {getMailgunApiConfig, getMailgunOptions} from './getMailgunConfig'
import mailgun from './mailgunDriver'
import templates from './templates'
import sendToSentry from '../utils/sendToSentry'

// See https://documentation.mailgun.com/en/latest/user_manual.html#batch-sending
const MAILGUN_MAX_BATCH_SIZE = 1000

const getEmailFactory = (template) => {
  const emailFactory = templates[template]
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`)
  }
  return emailFactory
}

const makeMailgunApiData = (recipients: string | string[], template: string, props: any) => {
  const to = typeof recipients === 'string' ? recipients : recipients.join(',')
  const {from} = getMailgunOptions()
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

const maybeMailgun = (fn, mailgunApiData: ReturnType<typeof makeMailgunApiData>) => {
  if (!getMailgunApiConfig().apiKey) {
    const {from, to, subject, body} = mailgunApiData
    console.warn(`mailgun: no API key, so not sending the following:
    From: ${from}
    To: ${to}
    Subject: ${subject}
    Body: ${body}
    `)
    return true
  }
  try {
    if (mailgun) {
      return fn(mailgun)
    }
  } catch (error) {
    const {to, subject} = mailgunApiData
    console.warn(error)
    console.warn(to, subject)
  }
  return false
}

export function sendBatchEmail (recipients, template, props, recipientVariables) {
  if (!Array.isArray(recipients)) {
    throw new Error('`recipients` must be an Array')
  }
  if (recipients.length > MAILGUN_MAX_BATCH_SIZE) {
    const chunkedRecipients = chunkArray(recipients, MAILGUN_MAX_BATCH_SIZE)
    console.warn(
      `Email for template ${template} exceeded mailgun maximum batch size of ${MAILGUN_MAX_BATCH_SIZE} ` +
        `with ${recipients.length} requested recipients.  ` +
        `Sending ${
          chunkedRecipients.length
        } mailgun requests of up to ${MAILGUN_MAX_BATCH_SIZE} recipients each.`
    )
    return Promise.all(
      chunkedRecipients.map((chunk) => sendBatchEmail(chunk, template, props, recipientVariables))
    )
  }
  const mailgunApiData = makeMailgunApiData(recipients, template, props)
  if (recipientVariables) {
    mailgunApiData['recipient-variables'] = JSON.stringify(recipientVariables)
  }
  return maybeMailgun((mg) => mg.messages().send(mailgunApiData), mailgunApiData)
}

const mailgunFrom = process.env.MAILGUN_FROM || ''
const mailgunKey = process.env.MAILGUN_API_KEY

interface EmailContent {
  subject: string
  body: string
  html: string
}

const sendMailgunEmail = async (to: string, emailContent: EmailContent) => {
  const {subject, body, html} = emailContent
  if (!mailgunKey) {
    console.log('No mailgun key. Logging email: ', to, '\n', subject, '\n', body)
    return true
  }
  try {
    await mailgun.messages().send({
      from: mailgunFrom,
      to,
      subject,
      text: body,
      html
    })
  } catch (e) {
    console.log(e)
    sendToSentry(new Error(`Error sending email: ${e.message}`))
    return false
  }
  return true
}

export const sendEmailContent = (
  maybeEmailAddresses: string | string[],
  emailContent: EmailContent
) => {
  const emailAddresses = Array.isArray(maybeEmailAddresses)
    ? maybeEmailAddresses
    : [maybeEmailAddresses]
  const to = emailAddresses.join(', ')
  return sendMailgunEmail(to, emailContent)
}

export default async function sendEmailPromise (to: unknown, template: string, props: any) {
  if (!to || typeof to !== 'string') {
    throw new Error('Expected `to` to be a string of comma-separated emails')
  }
  const emailFactory = templates[template]
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`)
  }

  const emailContent = emailFactory(props)
  return sendMailgunEmail(to, emailContent)
}
