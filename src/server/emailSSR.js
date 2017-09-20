import sendEmail from 'server/email/sendEmail';
import templates from 'server/email/templates';
import {MEETING_NAME, MEETING_SUMMARY_LABEL} from 'universal/utils/constants';

// erica.seldin.contractor@pepsico.com
// jordan@parabol.co

const EMAIL_DESTINATION = 'terry@parabol.co, terry_acker@yahoo.com';
const EMAIL_TEMPLATE = 'summaryEmail';
const EMAIL_ALL_PROPS = {
  summaryEmail: {
    title: `${MEETING_NAME} ${MEETING_SUMMARY_LABEL} from Parabol`,
    previewText: `${MEETING_NAME} ${MEETING_SUMMARY_LABEL} from Parabol`
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
