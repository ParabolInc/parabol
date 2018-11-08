import sendEmail from 'server/email/sendEmail'
import templates from 'server/email/templates'
import {MEETING_NAME, MEETING_SUMMARY_LABEL, RETROSPECTIVE} from 'universal/utils/constants'

// erica.seldin.contractor@pepsico.com
// jordan@parabol.co

const EMAIL_DESTINATION = 'terry@parabol.co, terry_acker@yahoo.com'

const EMAIL_ALL_PROPS = {
  summaryEmail: {
    title: `${MEETING_NAME} ${MEETING_SUMMARY_LABEL} from Parabol`,
    previewText: `${MEETING_NAME} ${MEETING_SUMMARY_LABEL} from Parabol`
  },
  newMeetingSummaryEmailCreator: {
    meeting: {
      id: 'HyluTLr5J',
      meetingType: RETROSPECTIVE,
      team: {
        id: 'team123',
        name: 'Team 123'
      },
      endedAt: new Date(),
      meetingMembers: [],
      reflectionGroups: []
    }
  },
  notificationSummary: {
    userId: '123',
    email: 'fake@123.co',
    name: 'First Last',
    numNotifications: '4'
  }
}
export default async function emailSSR (req, res) {
  const {template} = req.params
  const emailFactory = templates[template]
  const props = EMAIL_ALL_PROPS[template]
  /*
   * Render and send email
   *
   * Don't forget to set the MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAILGUN_FROM
   * environment variables if you want to send the email for reals.
   */
  await sendEmail(EMAIL_DESTINATION, template, props)

  // Render and show container:
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.send(emailFactory(props).html)
}
