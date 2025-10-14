import {GraphQLError} from 'graphql'
import type {ControlledTransaction} from 'kysely'
import ms from 'ms'
import {EMAIL_CORS_OPTIONS} from '../../../../client/types/cors'
import makeAppURL from '../../../../client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import getMailManager from '../../../email/getMailManager'
import pageSharedEmailCreator from '../../../email/pageSharedEmailCreator'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {selectDescendantPages} from '../../../postgres/select'
import type {DB} from '../../../postgres/types/pg'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {publishPageNotification} from '../../../utils/publishPageNotification'
import {DataLoaderWorker} from '../../graphql'
import type {MutationResolvers, PageRoleEnum, PageSubjectEnum} from '../resolverTypes'
import {PAGE_ROLES} from '../rules/hasPageAccess'
import publishNotification from './helpers/publishNotification'

const utmParams = {
  utm_source: 'shared page email',
  utm_medium: 'email',
  utm_campaign: 'invitations'
}

const isTrustworthy = async (dataLoader: DataLoaderWorker, userId: string) => {
  const [viewer, highestTier] = await Promise.all([
    dataLoader.get('users').loadNonNull(userId),
    dataLoader.get('highestTierForUserId').load(userId)
  ])
  if (!highestTier) return false
  if (highestTier !== 'starter') return true

  if (viewer.createdAt < new Date(Date.now() - ms('30d'))) return false

  const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
  if (meetingMembers.length < 3) return false

  const pg = getKysely()
  const colleagues = await pg
    .selectFrom('TeamMember as ut')
    .innerJoin('TeamMember as ot', 'ut.teamId', 'ot.teamId')
    .where('ut.userId', '=', userId)
    .where('ot.userId', '!=', userId)
    .select('ot.userId')
    .distinct()
    .execute()
  if (colleagues.length < 4) return false

  return true
}

const getNextIsPrivate = async (
  trx: ControlledTransaction<DB, []>,
  pageId: number,
  isPrivate: boolean,
  role: PageRoleEnum | null,
  viewerId: string,
  subjectType: PageSubjectEnum,
  subjectId: string
) => {
  if (isPrivate && role) {
    return subjectType !== 'user' || subjectId !== viewerId ? false : undefined
  }
  if (isPrivate || role) return undefined
  // only need to do the expensive query if removing access on a public page might make it private
  const willBePrivateRes = await trx
    .selectNoFrom(({and, not, exists, selectFrom}) => [
      and([
        selectFrom('PageUserAccess')
          .select(({eb, fn}) => eb(fn.countAll(), '<=', 1).as('val'))
          .where('pageId', '=', pageId)
          .limit(2),
        not(exists(selectFrom('PageTeamAccess').select('pageId').where('pageId', '=', pageId))),
        not(
          exists(selectFrom('PageOrganizationAccess').select('pageId').where('pageId', '=', pageId))
        ),
        not(exists(selectFrom('PageExternalAccess').select('pageId').where('pageId', '=', pageId)))
      ]).as('isPrivate')
    ])
    .executeTakeFirstOrThrow()
  return willBePrivateRes.isPrivate ? true : undefined
}

const updatePageAccess: MutationResolvers['updatePageAccess'] = async (
  _source,
  {pageId, subjectType, subjectId, role, unlinkApproved},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const [dbPageId, pageSlug] = CipherId.fromClient(pageId)
  const tableMap = {
    user: 'PageUserAccess',
    team: 'PageTeamAccess',
    organization: 'PageOrganizationAccess',
    external: 'PageExternalAccess'
  } as const
  const subjectMap = {
    user: 'userId',
    team: 'teamId',
    organization: 'orgId',
    external: 'email'
  } as const

  let nextSubjectType = subjectType
  let nextSubjectId = subjectId
  if (role && subjectType === 'external') {
    const existingUser = await getUserByEmail(subjectId)
    if (existingUser) {
      nextSubjectType = 'user'
      nextSubjectId = existingUser.id
      dataLoader.get('users').prime(existingUser.id, existingUser)
    } else {
      const MAX_UNACCEPTED_INVITES = 20
      // see how many outstanding email invites exist right now
      const outstandingInvites = await pg
        .selectFrom('PageExternalAccess')
        .select((eb) => eb.fn.count('email').distinct().as('count'))
        .where('invitedBy', '=', viewerId)
        .where('email', '!=', '*')
        .executeTakeFirstOrThrow()
      if (Number(outstandingInvites.count) > MAX_UNACCEPTED_INVITES) {
        throw new GraphQLError('Too many pending invitations sent')
      }
    }
  }
  const table = tableMap[nextSubjectType]
  const typeId = subjectMap[nextSubjectType]

  let unlinkFromParent = false
  const page = await dataLoader.get('pages').load(dbPageId)
  if (!page) throw new GraphQLError('Page not found')
  const {parentPageId, isParentLinked} = page
  if (parentPageId && isParentLinked) {
    // get the existing role for this
    const parentRoleRes = await pg
      .selectFrom(pg.dynamic.table(table).as('t'))
      .select('role')
      .where('pageId', '=', parentPageId)
      .where(pg.dynamic.ref(typeId), '=', nextSubjectId)
      .executeTakeFirst()
    if (parentRoleRes) {
      const isMoreRestrictive =
        !role || PAGE_ROLES.indexOf(role) > PAGE_ROLES.indexOf(parentRoleRes.role)
      if (isMoreRestrictive) {
        if (!unlinkApproved) {
          throw new GraphQLError('This will unlink the page permissions from the parent', {
            extensions: {
              code: 'UNAPPROVED_UNLINK'
            }
          })
        }
        unlinkFromParent = true
      }
    }
  }

  const trx = await pg.startTransaction().execute()
  if (!role) {
    await selectDescendantPages(trx, dbPageId)
      .deleteFrom(trx.dynamic.table(table).as('t'))
      .where('pageId', 'in', (qb) => qb.selectFrom('descendants').select('id'))
      .where(trx.dynamic.ref(typeId), '=', nextSubjectId)
      .execute()
  } else {
    let query = selectDescendantPages(trx, dbPageId).insertInto(table)

    if (table === 'PageExternalAccess') {
      query = query
        // log the invitedBy to prevent mass unsolicited invites from a single user
        .columns(['pageId', typeId as any, 'role', 'invitedBy'])
        .expression((eb) =>
          eb
            .selectFrom('descendants')
            .select(({val, ref}) => [
              ref('id').as('pageId'),
              val(nextSubjectId).as(typeId),
              val(role).as('role'),
              val(viewerId).as('invitedBy')
            ])
        )
    } else {
      query = query
        .columns(['pageId', typeId as any, 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants')
            .select(({val, ref}) => [
              ref('id').as('pageId'),
              val(nextSubjectId).as(typeId),
              val(role).as('role')
            ])
        )
    }
    await query
      .onConflict((oc) =>
        oc
          .columns(['pageId', typeId])
          .doUpdateSet({role})
          .whereRef(`${table}.role`, '!=', 'excluded.role')
      )
      .execute()
  }

  await updatePageAccessTable(trx, dbPageId)
  const strongestRole = await trx
    .selectFrom('PageAccess')
    .select(({fn}) => fn.min('role').as('role'))
    // since all children will have identical access, no need to query descendants
    .where('pageId', '=', dbPageId)
    .executeTakeFirst()

  if (!strongestRole || strongestRole.role !== 'owner') {
    await trx.rollback().execute()
    throw new GraphQLError('A Page must have at least one owner')
  }

  const willBePrivate = await getNextIsPrivate(
    trx,
    dbPageId,
    page.isPrivate,
    role || null,
    viewerId,
    nextSubjectType,
    nextSubjectId
  )

  if (willBePrivate !== undefined || unlinkFromParent) {
    await trx
      .updateTable('Page')
      .set({
        isParentLinked: unlinkFromParent ? false : undefined,
        isPrivate: willBePrivate
      })
      .where('id', '=', dbPageId)
      .execute()
  }

  await trx.commit().execute()
  dataLoader.get('pages').clear(dbPageId)

  // notifications
  if (role) {
    let invitationEmail: string | null = null

    if (nextSubjectType === 'external') {
      invitationEmail = nextSubjectId
    }
    if (nextSubjectType === 'user') {
      const [user, notification] = await Promise.all([
        dataLoader.get('users').load(nextSubjectId),
        pg
          .insertInto('Notification')
          .values({
            id: generateUID(),
            type: 'PAGE_ACCESS_GRANTED',
            userId: nextSubjectId,
            ownerId: viewerId,
            pageId: dbPageId,
            role
          })
          .returningAll()
          .executeTakeFirst()
      ])
      if (user?.sendPageInvitationEmail) {
        invitationEmail = user.email
      }
      publishNotification(notification!, subOptions)
    }
    if (invitationEmail) {
      const viewer = await dataLoader.get('users').loadNonNull(viewerId)
      const trustworthy = await isTrustworthy(dataLoader, viewerId)
      const pageLink = makeAppURL(appOrigin, `pages/${pageSlug}`, {
        searchParams: {
          ...utmParams,
          email: invitationEmail
        }
      })
      const {html, subject, body} = pageSharedEmailCreator({
        appOrigin,
        ownerName: trustworthy ? viewer.preferredName : null,
        ownerEmail: viewer.email,
        ownerAvatar: viewer.picture,
        pageName: trustworthy ? (page.title ?? 'Untitled') : null,
        pageLink,
        role,
        corsOptions: EMAIL_CORS_OPTIONS
      })
      await getMailManager().sendEmail({
        to: invitationEmail,
        html,
        subject,
        body,
        tags: ['type:pageSharedInvitation']
      })
    }
  }

  const data = {pageId: dbPageId}
  await publishPageNotification(dbPageId, 'UpdatePageAccessPayload', data, subOptions, dataLoader)
  return data
}

export default updatePageAccess
