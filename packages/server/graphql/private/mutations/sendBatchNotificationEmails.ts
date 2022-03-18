import ms from 'ms'
import appOrigin from '../../../appOrigin'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import getMailManager from '../../../email/getMailManager'
import notificationSummaryCreator from '../../../email/notificationSummaryCreator'
import getPg from '../../../postgres/getPg'
import {requireSU} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const sendBatchNotificationEmails: MutationResolvers['sendBatchNotificationEmails'] = async (
  _source,
  _args,
  {authToken}
) => {
  // AUTH
  requireSU(authToken)

  // RESOLUTION
  // Note - this may be a lot of data one day. userNotifications is an array
  // of all the users who have not logged in within the last 24 hours and their
  // associated notifications.
  const r = await getRethink()
  const now = Date.now()
  const yesterday = new Date(now - ms('1d'))
  const userNotificationCount = (await (
    r
      .table('Notification')
      // Only include notifications which occurred within the last day
      .filter((row) => row('createdAt').gt(yesterday))
      // de-dup users
      .group('userId') as any
  )
    .count()
    .ungroup()
    .map((group: RValue) => ({
      userId: group('group'),
      notificationCount: group('reduction')
    }))
    .run()) as {userId: string; notificationCount: number}[]

  const userNotificationMap = new Map(
    userNotificationCount.map((value) => [value.userId, value.notificationCount])
  )
  const pg = getPg()
  const users = await pg.query<{id: string; email: string; preferredName: string}>(
    `SELECT id, email, "preferredName" FROM "User"
    WHERE "id" = ANY($1::text[])
    AND NOT inactive
    AND "lastSeenAt" <= $2`,
    [[...userNotificationMap.keys()], yesterday]
  )

  await Promise.all(
    users.rows.map((user) => {
      const {email, preferredName} = user
      const notificationCount = userNotificationMap.get(user.id)!
      const {subject, html, body} = notificationSummaryCreator({
        preferredName,
        notificationCount,
        appOrigin
      })
      return getMailManager().sendEmail({
        to: email,
        subject,
        body,
        html,
        tags: ['type:notificationSummary']
      })
    })
  )
  return users.rows.map(({email}) => email)
}

export default sendBatchNotificationEmails
