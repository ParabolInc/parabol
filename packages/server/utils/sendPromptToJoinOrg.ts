import generateUID from '../generateUID'
import type {DataLoaderWorker} from '../graphql/graphql'
import getKysely from '../postgres/getKysely'
import type {User} from '../postgres/types'
import getDomainFromEmail from './getDomainFromEmail'
import isRequestToJoinDomainAllowed from './isRequestToJoinDomainAllowed'

const sendPromptToJoinOrg = async (
  newUser: Pick<User, 'id' | 'email' | 'identities'>,
  dataLoader: DataLoaderWorker
) => {
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
