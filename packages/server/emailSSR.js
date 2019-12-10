import templates from './email/templates'
import makeAppLink from './utils/makeAppLink'
import RethinkDataLoader from './utils/RethinkDataLoader'

const ORG_MEMBERS_LINK = makeAppLink('me/organizations/tzsqFnuzh/members')

const EMAIL_ALL_PROPS = {
  summaryEmail: {
    meeting: {
      teamName: 'Team 123',
      endedAt: new Date().toJSON(),
      agendaItemsCompleted: 3,
      invitees: []
    }
  },
  notificationSummary: {
    userId: '123',
    email: 'fake@123.co',
    name: 'First Last',
    numNotifications: '4'
  },
  teamInvite: {
    inviteLink: '#inviteLink',
    inviteeName: undefined,
    inviteeEmail: 'nolan@example.co',
    inviterName: 'Sara',
    inviterEmail: 'sara@example.co',
    teamName: 'Example Team'
  },
  UpcomingInvoiceEmailTemplate: {
    memberUrl: ORG_MEMBERS_LINK,
    periodEndStr: 'January 31',
    newUsers: [
      {
        email: 'nolan@company.co',
        name: 'Nolan'
      },
      {
        email: 'sara@another.co',
        name: 'Sara'
      }
    ]
  }
}
export default async function emailSSR(req, res) {
  const {template} = req.params
  const emailFactory = templates[template]
  const props = EMAIL_ALL_PROPS[template]
  /*
   * Render and send email
   *
   * Don't forget to set the MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAILGUN_FROM
   * environment variables if you want to send the email for reals.
   */
  // const sharedDataLoader = new DataLoaderWarehouse({
  //   onShare: '_share',
  //   ttl: 2000
  // })
  const authToken = {}
  // const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken, { cache: false }))

  const context = {
    socketId: 'foo',
    rateLimiter: null,
    // dataLoader,
    authToken
  }

  // await sendEmail(EMAIL_DESTINATION, template, {...props, context}).catch(console.error)
  const email = await emailFactory({...props, context}).catch(console.log)
  // Render and show container:
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.send(email.html)
}
