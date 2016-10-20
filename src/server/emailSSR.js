import sendEmail from 'server/email/sendEmail';
import templates from 'server/email/templates';

const EMAIL_DESTINATION = 'jordan@parabol.co';
const EMAIL_TEMPLATE = 'summaryEmail';
const EMAIL_ALL_PROPS = {
  summaryEmail: {
    title: 'Action Meeting Summary from Parabol',
    previewText: 'Action Meeting Summary from Parabol'
  }
};

export default async function emailSSR(req, res) {
  const emailFactory = templates[EMAIL_TEMPLATE];
  const props = EMAIL_ALL_PROPS[EMAIL_TEMPLATE];

  /*
   * Render and send email
   *
   * Don't forget to set the MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAILGUN_FROM
   * environment variables if you want to send the email for reals.
   */
  await sendEmail(EMAIL_DESTINATION, 'summaryEmail', props);

  // Render and show container:
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.send(emailFactory(props).html);
}
