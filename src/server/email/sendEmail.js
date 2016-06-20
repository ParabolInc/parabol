import templates from './templates';
import mailgun from './mailgunDriver';

export default async function sendEmail(name, variables) {
  const emailFactory = templates[name];
  if (!emailFactory) {
    throw new Error(`Email template for ${name} does not exist!`);
  }
  const email = emailFactory(variables);
  try {
    await mailgun.messages().send(email);
  } catch (e) {
    console.warn(`mailgun: unable to send welcome message ${e}`);
  }

  return true;
}
