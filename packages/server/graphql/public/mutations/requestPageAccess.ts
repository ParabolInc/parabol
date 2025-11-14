import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import ms from 'ms'
import makeAppURL from '../../../../client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import getMailManager from '../../../email/getMailManager'
import pageAccessRequestEmailCreator from '../../../email/pageAccessRequestEmailCreator'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import isValid from '../../isValid'
import type {MutationResolvers, PageRoleEnum} from '../resolverTypes'
import publishNotification from './helpers/publishNotification'

const requestPageAccess: MutationResolvers['requestPageAccess'] = async (
  _source,
  {pageId, reason, role},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const [dbPageId, pageSlug] = CipherId.fromClient(pageId)

  const [viewer, page, existingRequest, owners] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('pages').load(dbPageId),
    pg
      .selectFrom('PageAccessRequest')
      .selectAll()
      .where('pageId', '=', dbPageId)
      .where('userId', '=', viewerId)
      .executeTakeFirst(),
    pg
      .selectFrom('PageAccess')
      .selectAll()
      .where('pageId', '=', dbPageId)
      .where('role', '=', 'owner')
      .execute()
  ])
  if (!page) {
    throw new GraphQLError('Page not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (existingRequest && existingRequest.createdAt.valueOf() > Date.now() - ms('1 day')) {
    throw new GraphQLError('You have already requested access recently', {
      extensions: {code: 'TOO_MANY_REQUESTS'}
    })
  }

  const requestedRole: PageRoleEnum = role ?? 'viewer'

  await pg
    .insertInto('PageAccessRequest')
    .values({
      pageId: dbPageId,
      userId: viewerId,
      role,
      reason: reason?.trim() || null
    })
    .onConflict((oc) =>
      oc.columns(['userId', 'pageId']).doUpdateSet({createdAt: sql`CURRENT_TIMESTAMP`})
    )
    .execute()

  const notificationsToInsert = owners.map(({userId}) => ({
    id: generateUID(),
    type: 'PAGE_ACCESS_REQUESTED' as const,
    userId,
    role: requestedRole,
    requestCreatedBy: viewerId,
    pageId: dbPageId
  }))

  await pg.insertInto('Notification').values(notificationsToInsert).execute()

  notificationsToInsert.forEach((notification) => {
    publishNotification(notification, subOptions)
  })

  const pageLink = makeAppURL(appOrigin, `pages/${pageSlug}?share`, {
    searchParams: {
      share: true
    }
  })
  const {html, subject, body} = pageAccessRequestEmailCreator({
    requesterName: viewer.preferredName,
    requesterEmail: viewer.email,
    requesterAvatar: viewer.picture,
    reason,
    pageName: page.title ?? 'Untitled',
    pageLink,
    role
  })
  const ownerUsers = await dataLoader.get('users').loadMany(owners.map(({userId}) => userId))
  await Promise.all(
    ownerUsers.filter(isValid).map(({email}) =>
      getMailManager().sendEmail({
        to: email,
        html,
        subject,
        body,
        tags: ['type:pageSharedInvitation']
      })
    )
  )

  return true
}

export default requestPageAccess
