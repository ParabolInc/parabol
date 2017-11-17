import mailcomposer from 'mailcomposer';
import chunkArray from 'universal/utils/chunkArray';
import templates from './templates';
import mailgun from './mailgunDriver';
import {getMailgunApiConfig, getMailgunOptions} from './getMailgunConfig';
import createEmbeddedImages from './createEmbeddedImages';

// See https://documentation.mailgun.com/en/latest/user_manual.html#batch-sending
const MAILGUN_MAX_BATCH_SIZE = 1000;

const buildMail = (options) =>
  new Promise((resolve, reject) => {
    mailcomposer(options).build((error, message) => {
      if (error) {
        return reject(error);
      }
      return resolve(message);
    });
  });

const getEmailFactory = (template) => {
  const emailFactory = templates[template];
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`);
  }
  return emailFactory;
};

const makeMailgunApiData = (recipients, template, props) => {
  const to = typeof recipients === 'string' ? recipients : recipients.join(',');
  const {from} = getMailgunOptions();
  const emailFactory = getEmailFactory(template);
  const {subject, body, html: htmlWithoutImages} = emailFactory(props);
  const {html, attachments} = createEmbeddedImages(htmlWithoutImages);
  return {
    from,
    to,
    subject,
    body,
    html,
    attachments
  };
};

const maybeBuildMail = async (mailOptions) => {
  try {
    return await buildMail(mailOptions);
  } catch (e) {
    console.warn(`mailcomposer: unable to build message ${e}`);
  }
  return false;
};

const maybeMailgun = (fn, mailgunApiData) => {
  if (!getMailgunApiConfig().apiKey) {
    const {from, to, subject, body} = mailgunApiData;
    console.warn(`mailgun: no API key, so not sending the following:
    From: ${from}
    To: ${to}
    Subject: ${subject}
    Body: ${body}
    `);
    return true;
  }
  try {
    if (mailgun) {
      return fn(mailgun);
    }
  } catch (error) {
    console.warn(error);
  }
  return false;
};

export function sendBatchEmail(recipients, template, props, recipientVariables) {
  if (!Array.isArray(recipients)) {
    throw new Error('`recipients` must be an Array');
  }
  if (recipients.length > MAILGUN_MAX_BATCH_SIZE) {
    const chunkedRecipients = chunkArray(recipients, MAILGUN_MAX_BATCH_SIZE);
    console.warn(
      `Email for template ${template} exceeded mailgun maximum batch size of ${MAILGUN_MAX_BATCH_SIZE} ` +
        `with ${recipients.length} requested recipients.  ` +
        `Sending ${chunkedRecipients.length} mailgun requests of up to ${MAILGUN_MAX_BATCH_SIZE} recipients each.`
    );
    return Promise.all(chunkedRecipients.map((chunk) => sendBatchEmail(chunk, template, props, recipientVariables)));
  }
  const mailgunApiData = makeMailgunApiData(recipients, template, props);
  if (recipientVariables) {
    mailgunApiData['recipient-variables'] = JSON.stringify(recipientVariables);
  }
  return maybeMailgun(
    (mg) => mg.messages().send(mailgunApiData),
    mailgunApiData
  );
}

export default async function sendEmailPromise(to, template, props) {
  if (!to || typeof to !== 'string') {
    throw new Error('Expected `to` to be a string of comma-seperated emails');
  }
  const mailOptions = makeMailgunApiData(to, template, props);
  const message = await maybeBuildMail(mailOptions);
  if (!message) {
    return false;
  }
  const mimeData = {
    to,
    message: message.toString('ascii')
  };
  return maybeMailgun(
    (mg) => mg.messages().sendMime(mimeData).then(() => true),
    mailOptions
  );
}
