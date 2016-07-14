import mailcomposer from 'mailcomposer';
import templates from './templates';
import mailgun from './mailgunDriver';
import {getMailgunOptions} from './getMailgunConfig';
import createEmbeddedImages from './createEmbeddedImages';

const buildMail = (options) => new Promise((resolve, reject) => {
  mailcomposer(options).build((error, message) => {
    if (error) {
      return reject(error);
    }
    return resolve(message);
  });
});

const maybeBuildMail = async(mailOptions) => {
  try {
    return await buildMail(mailOptions);
  } catch (e) {
    console.warn(`mailcomposer: unable to build message ${e}`);
  }
  return false;
};

const maybeSendMail = async(mimeData) => {
  try {
    await mailgun.messages().sendMime(mimeData);
  } catch (e) {
    console.warn(`mailgun: unable to send welcome message ${e}`);
    return false;
  }
  return true;
};

export default async function sendEmailPromise(to, template, props) {
  const emailFactory = templates[template];
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`);
  }
  const renderedEmail = emailFactory(props);
  const emailWithAttachments = createEmbeddedImages(renderedEmail);
  const {from} = getMailgunOptions();
  const mailOptions = {
    ...emailWithAttachments,
    from,
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
  return maybeSendMail(mimeData);
}
