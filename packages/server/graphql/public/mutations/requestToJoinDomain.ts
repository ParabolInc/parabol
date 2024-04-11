import ms from 'ms'
import getRethink from '../../../database/rethinkDriver'
import NotificationRequestToJoinOrg from '../../../database/types/NotificationRequestToJoinOrg'
import getKysely from '../../../postgres/getKysely'
import getTeamIdsByOrgIds from '../../../postgres/queries/getTeamIdsByOrgIds'
import {getUserId} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import {getEligibleOrgIdsByDomain} from '../../../utils/isRequestToJoinDomainAllowed'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'
import publishNotification from './helpers/publishNotification'

const REQUEST_EXPIRATION_DAYS = 30

const requestToJoinDomain: MutationResolvers['requestToJoinDomain'] = async (
  _source,
  {},
  {authToken, dataLoader}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const domain = getDomainFromEmail(viewer.email)
  const now = new Date()

  const orgIds = await getEligibleOrgIdsByDomain(domain, viewerId, dataLoader)

  if (!orgIds.length) {
    return standardError(new Error('No relevant organizations in the domain were found'))
  }

  const insertResult = await pg
    .insertInto('DomainJoinRequest')
    .values({
      createdBy: viewerId,
      domain,
      expiresAt: new Date(now.getTime() + ms(`${REQUEST_EXPIRATION_DAYS}d`))
    })
    .onConflict((oc) => oc.columns(['createdBy', 'domain']).doNothing())
    .returning('id')
    .executeTakeFirst()

  if (!insertResult) {
    // Request is already exists, lets return success without sending duplicate notifications
    return {success: true}
  }

  const teamIds = await getTeamIdsByOrgIds(orgIds)

  const leadUserIds = (await r
    .table('TeamMember')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({
      isNotRemoved: true,
      isLead: true
    })
    .pluck('userId')
    .distinct()('userId')
    .run()) as string[]

  const notificationsToInsert = leadUserIds.map((userId) => {
    return new NotificationRequestToJoinOrg({
      userId,
      email: viewer.email,
      name: viewer.preferredName,
      picture: viewer.picture,
      requestCreatedBy: viewerId,
      domainJoinRequestId: insertResult.id
    })
  })

  await r.table('Notification').insert(notificationsToInsert).run()

  notificationsToInsert.forEach((notification) => {
    publishNotification(notification, subOptions)
  })

  return {success: true}
}

export default requestToJoinDomain
