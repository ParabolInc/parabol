import ms from 'ms'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'
import getKysely from "../../../postgres/getKysely";
import isRequestToJoinDomainAllowed from "../../../utils/isRequestToJoinDomainAllowed";

const REQUEST_EXPIRATION_DAYS = 30

const requestToJoinDomain: MutationResolvers['requestToJoinDomain'] = async (
  _source,
  {},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const domain = viewer.email.split('@')[1]
  const now = new Date()

  if (!(await isRequestToJoinDomainAllowed(domain))) {
    return { success: false }
  }

  const insertResult = await pg
    .insertInto('DomainJoinRequest')
    .values({
      createdBy: viewerId,
      domain,
      expiresAt: new Date(
        now.getTime() + ms(`${REQUEST_EXPIRATION_DAYS}d`)
      )
    })
    .onConflict((oc) => oc
      .columns(['createdBy', 'domain'])
      .doNothing()
    )
    .returning('id')
    .executeTakeFirst()

  if (!insertResult) {
    return { success: false }
  }

  return { success: true }
}

export default requestToJoinDomain
