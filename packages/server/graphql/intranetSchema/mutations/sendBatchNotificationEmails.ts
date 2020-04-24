import {GraphQLList, GraphQLString} from 'graphql'
import ms from 'ms'
import getRethink from '../../../database/rethinkDriver'
import {sendBatchEmail} from '../../../email/sendEmail'
import {requireSU} from '../../../utils/authorization'

const sendBatchNotificationEmails = {
  type: new GraphQLList(GraphQLString),
  description:
    'Send summary emails of unread notifications to all users who have not been seen within the last 24 hours',
  async resolve(_source, _args, {authToken}) {
    // AUTH
    requireSU(authToken)

    // RESOLUTION
    // Note - this may be a lot of data one day. userNotifications is an array
    // of all the users who have not logged in within the last 24 hours and their
    // associated notifications.
    const r = await getRethink()
    const now = Date.now()
    const today = new Date(now)
    const yesterday = new Date(now - ms('1d'))
    const userNotifications = await r
      .table('Notification')
      // Only include notifications which occurred within the last day
      .filter((row) => row('createdAt').gt(yesterday))
      // join with the users table
      .eqJoin('userId', r.table('User'))
      // filter to active users not seen within the last day
      .filter((row) =>
        r.and(row('right')('inactive').eq(false), row('right')('lastSeenAt').lt(yesterday))
      )
      // clean up the join
      .map((join) => ({
        userId: join('right')('id'),
        email: join('right')('email'),
        preferredName: join('right')('preferredName'),
        notification: join('left')
      }))
      // de-dup users
      .group('userId')
      .ungroup()
      .map((group) => ({
        userId: group('group'),
        email: group('reduction')(0)('email'),
        name: group('reduction')(0)('preferredName'),
        numNotifications: group('reduction').count()
      }))
      .run()

    const emails = userNotifications.map(({email}) => email)
    const recipientVariables = userNotifications.reduce(
      (addressMap, {email, name, numNotifications}) => ({
        ...addressMap,
        [email]: {name, numNotifications}
      }),
      {}
    )
    if (emails.length) {
      await sendBatchEmail(emails, 'notificationSummary', {date: today}, recipientVariables)
    }
    return emails
  }
}

export default sendBatchNotificationEmails
