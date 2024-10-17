import ms from 'ms'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import {getEligibleOrgIdsByDomain} from '../../../utils/isRequestToJoinDomainAllowed'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'
import publishNotification from './helpers/publishNotification'

const REQUEST_EXPIRATION_DAYS = 30

const requestToJoinDomain: MutationResolvers['requestToJoinDomain'] = async (
  _source,
  _args,
  {authToken, dataLoader}
) => {
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

  const orgTeams = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(isValid).flat()
  const teamIds = orgTeams.map(({id}) => id)
  const teamMembers = (await dataLoader.get('teamMembersByTeamId').loadMany(teamIds))
    .filter(isValid)
    .flat()
  const leadTeamMembers = teamMembers.filter(({isLead}) => isLead)
  const leadUserIds = [...new Set(leadTeamMembers.map(({userId}) => userId))]

  const notificationsToInsert = leadUserIds.map((userId) => ({
    id: generateUID(),
    type: 'REQUEST_TO_JOIN_ORG' as const,
    userId,
    email: viewer.email,
    name: viewer.preferredName,
    picture: viewer.picture,
    requestCreatedBy: viewerId,
    domainJoinRequestId: insertResult.id
  }))

  await pg.insertInto('Notification').values(notificationsToInsert).execute()

  notificationsToInsert.forEach((notification) => {
    publishNotification(notification, subOptions)
  })

  return {success: true}
}

export default requestToJoinDomain
