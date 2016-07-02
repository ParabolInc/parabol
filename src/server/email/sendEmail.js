import mailcomposer from 'mailcomposer';
import templates from './templates';
import mailgun from './mailgunDriver';
import {getMailgunOptions} from './getMailgunConfig';
import createEmbeddedImages from './createEmbeddedImages';

export default async function sendEmail(to, template, props) {
  const emailFactory = templates[template];
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`);
  }

  const mailOptions = Object.assign(
    createEmbeddedImages( // extract image attachments
      emailFactory(props) // render the html and text email
    ),
    getMailgunOptions(), // assign default from: address
    { to }               // assign to: address
  );

  const buildMail = (options) => new Promise((resolve, reject) => {
    mailcomposer(options).build((error, message) => {
      if (error) {
        return reject(error);
      }
      return resolve(message);
    });
  });

  let message = null;
  try {
    // TODO: this is returning undefined. We must begin our investigation here.
    message = await buildMail(mailOptions);
  } catch (e) {
    console.warn(`mailcomposer: unable to build message ${e}`);
    return false;
  }

  const data = ({
    to,
    message: message.toString('ascii')
  });

  try {
    await mailgun.messages().sendMime(data);
  } catch (e) {
    console.warn(`mailgun: unable to send welcome message ${e}`);
    return false;
  }

  return true;
}
