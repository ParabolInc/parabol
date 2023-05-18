import getRethink from '../database/rethinkDriver'
import NotificationPromptToJoinOrg from '../database/types/NotificationPromptToJoinOrg'
import isRequestToJoinDomainAllowed from './isRequestToJoinDomainAllowed'
import getDomainFromEmail from './getDomainFromEmail'

const sendPromptToJoinOrg = async (email: string, userId: string) => {
  const r = await getRethink()

  const activeDomain = getDomainFromEmail(email)

  if (!(await isRequestToJoinDomainAllowed(activeDomain, userId))) {
    return
  }

  const notificationToInsert = new NotificationPromptToJoinOrg({
    userId,
    activeDomain
  })

  await r.table('Notification').insert(notificationToInsert).run()
}

export default sendPromptToJoinOrg
