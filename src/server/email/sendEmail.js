import mailcomposer from 'mailcomposer';
import chunkArray from 'universal/utils/chunkArray';
import templates from './templates';
import mailgun from './mailgunDriver';
import {getMailgunApiConfig, getMailgunOptions} from './getMailgunConfig';
import createEmbeddedImages from './createEmbeddedImages';

// See https://documentation.mailgun.com/en/latest/user_manual.html#batch-sending
const MAILGUN_MAX_BATCH_SIZE = 1000;

const buildMail = (options) => new Promise((resolve, reject) => {
  mailcomposer(options).build((error, message) => {
    if (error) {
      return reject(error);
    }
    return resolve(message);
  });
});

const maybeBuildMail = async (mailOptions) => {
  try {
    return await buildMail(mailOptions);
  } catch (e) {
    console.warn(`mailcomposer: unable to build message ${e}`);
  }
  return false;
};

const maybeSendMail = async (mimeData) => {
  try {
    if (mailgun) {
      await mailgun.messages().sendMime(mimeData);
    }
  } catch (e) {
    console.warn(`mailgun: unable to send message ${e}`);
    return false;
  }
  return true;
};

/**
 * Requests that mailgun send an email to some number of recipients.
 *
 * Note that the `to` argument may be a comma-separated string of addresses or an array.
 * If you provide the list of email addresses as a comma-separated string, we will *not*
 * validate the number of email addresses, and you may exceed mailgun's maximum batch size.
 * However, if you provide an array of email addresses, we'll make sure not to exceed the
 * mailgun maximum batch size by splitting up the request into several smaller requests
 * if necessary.
 *
 */
export default async function sendEmailPromise(to, template, props, recipientVariables) {
  const emailFactory = templates[template];
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`);
  }
  if (!to || typeof to !== 'string' || !Array.isArray(to)) {
    throw new Error('Expected `to` to be an array of email addresses or a string of comma-seperated email addresses');
  }
  const recipientsArray = typeof to === 'string' ? to.split(',') : to;
  if (recipientsArray.length > MAILGUN_MAX_BATCH_SIZE) {
    const chunkedRecipients = chunkArray(recipientsArray, MAILGUN_MAX_BATCH_SIZE);
    console.warn(
      `Email for template ${template} exceeded mailgun maximum batch size of ${MAILGUN_MAX_BATCH_SIZE} with ${recipientsArray.length} requested recipients.  ` +
      `Sending ${chunkedRecipients.length} mailgun requests of up to ${MAILGUN_MAX_BATCH_SIZE} recipients each.`
    );
    return Promise.all(chunkedRecipients.map((recipients) => sendEmailPromise(recipients, template, props)));
  }
  const {subject, body, html: htmlWithoutImages} = emailFactory(props);
  const {html, attachments} = createEmbeddedImages(htmlWithoutImages);
  const {from} = getMailgunOptions();
  const mailOptions = {
    attachments,
    body,
    from,
    html,
    subject,
    to
  };

  const message = await maybeBuildMail(mailOptions);
  if (!message) {
    return false;
  }
  const mimeData = {
    to,
    message: message.toString('ascii')
  };
  if (recipientVariables) {
    mimeData['recipient-variables'] = JSON.stringify(recipientVariables);
  }
  if (!getMailgunApiConfig().apiKey) {
    console.warn(`mailgun: no API key, so not sending the following:
    From: ${from}
    To: ${to}
    Subject: ${subject}
    Body: ${body}
    `);
    return true;
  }
  return maybeSendMail(mimeData);
}
