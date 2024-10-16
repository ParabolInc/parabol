import User from '../database/types/User'
import generateUID from '../generateUID'
import {DataLoaderWorker} from '../graphql/graphql'
import getKysely from '../postgres/getKysely'
import getDomainFromEmail from './getDomainFromEmail'
import isRequestToJoinDomainAllowed from './isRequestToJoinDomainAllowed'

const sendPromptToJoinOrg = async (newUser: User, dataLoader: DataLoaderWorker) => {
  const {id: userId, email} = newUser
  const pg = getKysely()
  const activeDomain = getDomainFromEmail(email)

  if (!(await isRequestToJoinDomainAllowed(activeDomain, newUser, dataLoader))) {
    return
  }

  await pg
    .insertInto('Notification')
    .values({
      id: generateUID(),
      type: 'PROMPT_TO_JOIN_ORG',
      userId,
      activeDomain
    })
    .execute()
}

export default sendPromptToJoinOrg
