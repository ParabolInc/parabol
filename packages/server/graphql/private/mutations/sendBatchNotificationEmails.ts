import ms from 'ms'
import appOrigin from '../../../appOrigin'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import AuthToken from '../../../database/types/AuthToken'
import getMailManager from '../../../email/getMailManager'
import notificationSummaryCreator from '../../../email/notificationSummaryCreator'
import ServerEnvironment from '../../../email/ServerEnvironment'
import getPg from '../../../postgres/getPg'
import {MutationResolvers} from '../resolverTypes'

const sendBatchNotificationEmails: MutationResolvers['sendBatchNotificationEmails'] = async (
  _source,
  _args,
  {dataLoader}
) => {
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
      .filter({status: 'UNREAD'})
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

  // :TODO: (jmtaber129): Filter out team invitations for users who are already on the team.
  // :TODO: (jmtaber129): Filter out "stage timer" notifications if the meeting has already
  // progressed to the next stage.

  const userNotificationMap = new Map(
    userNotificationCount.map((value) => [value.userId, value.notificationCount])
  )
  const pg = getPg()
  const users = await pg.query<{
    id: string
    email: string
    tms: string[]
    preferredName: string
  }>(
    `SELECT id, email, tms, "preferredName" FROM "User"
    WHERE "id" = ANY($1::text[])
    AND NOT inactive`,
    [[...userNotificationMap.keys()]]
  )

  // :TODO: (jmtaber129): Filter out users whose only notification is a team invitation

  await Promise.all(
    users.rows.map(async (user) => {
      const {email, tms, preferredName} = user
      const notificationCount = userNotificationMap.get(user.id)!

      const authToken = new AuthToken({sub: user.id, tms, rol: 'impersonate'})
      const environment = new ServerEnvironment(authToken, dataLoader.share())
      const {subject, html, body} = await notificationSummaryCreator({
        preferredName,
        notificationCount,
        appOrigin,
        environment
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
