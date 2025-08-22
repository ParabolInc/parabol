import {GraphQLError} from 'graphql'
import type {ControlledTransaction} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {selectDescendantPages} from '../../../postgres/select'
import type {DB} from '../../../postgres/types/pg'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {publishPageNotification} from '../../../utils/publishPageNotification'
import type {MutationResolvers, PageRoleEnum, PageSubjectEnum} from '../resolverTypes'
import {PAGE_ROLES} from '../rules/hasPageAccess'

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
  const [dbPageId] = CipherId.fromClient(pageId)
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
    await selectDescendantPages(trx, dbPageId)
      .insertInto(table)
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
      .onConflict((oc) =>
        oc
          .columns(['pageId', typeId])
          .doUpdateSet({role})
          .whereRef(`${table}.role`, '!=', 'excluded.role')
      )
      .execute()
  }

  const strongestRole = await updatePageAccessTable(trx, dbPageId)
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
  const data = {pageId: dbPageId}
  await publishPageNotification(dbPageId, 'UpdatePageAccessPayload', data, subOptions, dataLoader)
  return data
}

export default updatePageAccess
