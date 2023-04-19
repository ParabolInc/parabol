import getRethink from '../database/rethinkDriver'
import NotificationPromptToJoinOrg from '../database/types/NotificationPromptToJoinOrg'
import isRequestToJoinDomainAllowed from './isRequestToJoinDomainAllowed'
import getDomainFromEmail from './getDomainFromEmail'

const sendPromptToJoinOrg = async (email, userId) => {
  console.log('sendPromptToJoinOrg', email, userId)
  const r = await getRethink()

  const activeDomain = getDomainFromEmail(email)

  if (!(await isRequestToJoinDomainAllowed(activeDomain))) {
    console.log('Request not allowed')
    return
  }

  const notificationToInsert = new NotificationPromptToJoinOrg({
    userId,
    activeDomain
  })

  console.log('NotificationToInsert', notificationToInsert)

  await r.table('Notification').insert(notificationToInsert).run()
}

export default sendPromptToJoinOrg
