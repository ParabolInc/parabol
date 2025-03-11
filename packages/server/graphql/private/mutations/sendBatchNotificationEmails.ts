import ms from 'ms'
import appOrigin from '../../../appOrigin'
import AuthToken from '../../../database/types/AuthToken'
import ServerEnvironment from '../../../email/ServerEnvironment'
import getMailManager from '../../../email/getMailManager'
import notificationSummaryCreator from '../../../email/notificationSummaryCreator'
import getKysely from '../../../postgres/getKysely'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

const sendBatchNotificationEmails: MutationResolvers['sendBatchNotificationEmails'] = async (
  _source,
  _args,
  {dataLoader}
) => {
  const pg = getKysely()
  // RESOLUTION
  // Note - this may be a lot of data one day. userNotifications is an array
  // of all the users who have not logged in within the last 24 hours and their
  // associated notifications.
  const now = Date.now()
  const yesterday = new Date(now - ms('1d'))
  const userNotificationCount = await pg
    .selectFrom('Notification')
    .select(({fn}) => ['userId', fn.count('id').as('notificationCount')])
    .where('createdAt', '>', yesterday)
    .where('status', '=', 'UNREAD')
    .groupBy('userId')
    .execute()

  // :TODO: (jmtaber129): Filter out team invitations for users who are already on the team.
  // :TODO: (jmtaber129): Filter out "stage timer" notifications if the meeting has already
  // progressed to the next stage.

  const notifications = (await Promise.all(userNotificationCount.map(async (value) => {
    const [user, teamMembers] = await Promise.all([
      dataLoader.get('users').load(value.userId),
      dataLoader.get('teamMembersByUserId').load(value.userId),
    ])

    if (!user) return null
    return {
      user,
      tms: teamMembers?.map(({teamId}) => teamId) ?? [],
      notificationCount: Number(value.notificationCount),
    }
  }))).filter(isValid)

  // :TODO: (jmtaber129): Filter out users whose only notification is a team invitation

  await Promise.all(
    notifications.map(async (notification) => {
      const {user, tms, notificationCount} = notification
      const {email, preferredName} = user

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
  return notifications.map(({user}) => user.email)
}

export default sendBatchNotificationEmails
