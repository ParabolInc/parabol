import mailcomposer from 'mailcomposer';
import templates from './templates';
import mailgun from './mailgunDriver';
import {getMailgunOptions} from './getMailgunConfig';

export default async function sendEmail(to, template, props) {
  const emailFactory = templates[template];
  if (!emailFactory) {
    throw new Error(`Email template for ${template} does not exist!`);
  }

  console.log('--------------- moe ---------------');
  console.log(emailFactory(props));

  const mail = mailcomposer(Object.assign(
    emailFactory(props), // render the html and text email
    getMailgunOptions()  // assign default from: address
  ));

  let message = null;

  try {
    // TODO: this is returning undefined. We must begin our investigation here.
    message = await mail.build();
  } catch (e) {
    console.warn(`mailcomposer: unable to build message ${e}`);
    return false;
  }

  console.log('--------------- larry ---------------');
  console.log(message);

  const data = ({
    to,
    message: message.toString('ascii')
  });

  console.log('--------------- curly ---------------');
  console.log(message.toString('ascii'));

  try {
    await mailgun.messages().sendMime(data);
  } catch (e) {
    console.warn(`mailgun: unable to send welcome message ${e}`);
    return false;
  }

  return true;
}
