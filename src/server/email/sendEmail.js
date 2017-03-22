import mailcomposer from 'mailcomposer';
import templates from './templates';
import mailgun from './mailgunDriver';
import {getMailgunApiConfig, getMailgunOptions} from './getMailgunConfig';
import createEmbeddedImages from './createEmbeddedImages';

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

export default async function sendEmailPromise(to, template, props) {
  const emailFactory = templates[template];
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`);
  }
  if (!to || typeof to !== 'string') {
    throw new Error('Expected `to` to be a string of comma-seperated emails');
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
