import getRethink from '../database/rethinkDriver'
import NotificationPromptToJoinOrg from '../database/types/NotificationPromptToJoinOrg'
import isRequestToJoinDomainAllowed from './isRequestToJoinDomainAllowed'
import getDomainFromEmail from './getDomainFromEmail'
import User from '../database/types/User'

const sendPromptToJoinOrg = async (newUser: User) => {
  const {id: userId, email} = newUser
  const r = await getRethink()

  const activeDomain = getDomainFromEmail(email)

  if (!(await isRequestToJoinDomainAllowed(activeDomain, newUser))) {
    return
  }

  const notificationToInsert = new NotificationPromptToJoinOrg({
    userId,
    activeDomain
  })

  await r.table('Notification').insert(notificationToInsert).run()
}

export default sendPromptToJoinOrg
