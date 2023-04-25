import ms from 'ms'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'
import getKysely from '../../../postgres/getKysely'
import isRequestToJoinDomainAllowed from '../../../utils/isRequestToJoinDomainAllowed'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import standardError from '../../../utils/standardError'
import generateUID from '../../../generateUID'

const REQUEST_EXPIRATION_DAYS = 30

const requestToJoinDomain: MutationResolvers['requestToJoinDomain'] = async (
  _source,
  {},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const domain = getDomainFromEmail(viewer.email)
  const now = new Date()

  if (!(await isRequestToJoinDomainAllowed(domain))) {
    return standardError(new Error('No relevant organizations in the domain were found'))
  }

  await pg
    .insertInto('DomainJoinRequest')
    .values({
      id: generateUID(),
      createdBy: viewerId,
      domain,
      expiresAt: new Date(now.getTime() + ms(`${REQUEST_EXPIRATION_DAYS}d`))
    })
    .onConflict((oc) => oc.columns(['createdBy', 'domain']).doNothing())
    .returning('id')
    .executeTakeFirst()

  return {success: true}
}

export default requestToJoinDomain
