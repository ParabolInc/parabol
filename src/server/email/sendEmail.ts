import chunkArray from 'universal/utils/chunkArray'
import createEmbeddedImages from './createEmbeddedImages'
import {getMailgunApiConfig, getMailgunOptions} from './getMailgunConfig'
import inlineImages from './inlineImages'
import mailgun from './mailgunDriver'
import templates from './templates'

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

const maybeMailgun = (fn, mailgunApiData) => {
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
    console.warn(error)
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

export default async function sendEmailPromise (to: unknown, template: string, props: any) {
  if (!to || typeof to !== 'string') {
    throw new Error('Expected `to` to be a string of comma-separated emails')
  }
  const emailFactory = templates[template]
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`)
  }

  const {subject, body, html: htmlWithoutImages} = emailFactory(props)
  if (!mailgunKey) {
    console.log('No mailgun key. Logging email: ', to, '\n', subject, '\n', body)
    return true
  }
  const {html, attachmentOptions} = await inlineImages(htmlWithoutImages)
  try {
    await mailgun.messages().send({
      from: mailgunFrom,
      to,
      subject,
      text: body,
      html,
      inline: attachmentOptions.map((options) => new mailgun.Attachment(options))
    })
  } catch (e) {
    return false
  }
  return true
}
