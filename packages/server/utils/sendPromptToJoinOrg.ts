import getRethink from '../database/rethinkDriver'
import NotificationPromptToJoinOrg from '../database/types/NotificationPromptToJoinOrg'
import User from '../database/types/User'
import {DataLoaderWorker} from '../graphql/graphql'
import getKysely from '../postgres/getKysely'
import getDomainFromEmail from './getDomainFromEmail'
import isRequestToJoinDomainAllowed from './isRequestToJoinDomainAllowed'

const sendPromptToJoinOrg = async (newUser: User, dataLoader: DataLoaderWorker) => {
  const {id: userId, email} = newUser
  const pg = getKysely()
  const r = await getRethink()

  const activeDomain = getDomainFromEmail(email)

  if (!(await isRequestToJoinDomainAllowed(activeDomain, newUser, dataLoader))) {
    return
  }

  const notificationToInsert = new NotificationPromptToJoinOrg({
    userId,
    activeDomain
  })

  await r.table('Notification').insert(notificationToInsert).run()
  await pg.insertInto('Notification').values(notificationToInsert).execute()
}

export default sendPromptToJoinOrg
