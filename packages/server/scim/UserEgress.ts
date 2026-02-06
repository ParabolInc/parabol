import {ExpressionBuilder, ExpressionWrapper, SqlBool, sql} from 'kysely'
import SCIMMY from 'scimmy'
import getKysely from '../postgres/getKysely'
import {DB} from '../postgres/types/pg'
import {logSCIMRequest} from './logSCIMRequest'
import {mapToSCIM} from './mapToSCIM'
import {SCIMContext} from './SCIMContext'

const SortByColumnMap = {
  userName: 'scimUserName',
  createdAt: 'createdAt'
} as const

type WhereExpressionBuilder = (
  eb: ExpressionBuilder<DB, 'User'>,
  value: string
) => ExpressionWrapper<DB, 'User', SqlBool>
const FilterColumnMap: Record<string, WhereExpressionBuilder> = {
  email: (eb, value) => eb('email', '=', value.toLowerCase().trim()),
  externalId: (eb, value) => eb('scimExternalId', '=', value),
  userName: (eb, value) => {
    const normalized = value.toLowerCase().trim()
    return eb.or([
      eb('scimUserName', '=', value.toLowerCase().trim()),
      eb.and([eb('scimUserName', 'is', null), eb('persistentNameId', '=', normalized)]),
      eb.and([
        eb('scimUserName', 'is', null),
        eb('persistentNameId', 'is', null),
        eb('email', '=', normalized)
      ])
    ])
  }
}

SCIMMY.Resources.declare(SCIMMY.Resources.User).egress(async (resource, ctx: SCIMContext) => {
  const {ip, authToken, dataLoader} = ctx

  const {id: userId, constraints, filter} = resource

  const {startIndex, count = 20, sortBy, sortOrder} = constraints ?? {}

  const scimId = authToken.sub!
  const saml = await dataLoader.get('saml').loadNonNull(scimId)
  const {domains, orgId} = saml

  logSCIMRequest(scimId, ip, {operation: `User engress`, userId})

  const orgMembers = await dataLoader.get('organizationUsersByOrgId').load(orgId!)
  const orgUsers = orgMembers.map(({userId}) => userId)

  const pg = getKysely()

  let userQuery = pg
    .selectFrom('User')
    .selectAll()
    .$if(!!userId, (qb) => qb.where('id', '=', userId!))
    .where((eb) =>
      eb.or([
        eb('scimId', '=', scimId),
        eb('domain', '=', eb.fn.any(eb.val(domains))),
        eb('id', '=', eb.fn.any(eb.val(orgUsers)))
      ])
    )
  //.where('isRemoved', '=', false)

  if (userId) {
    const user = await userQuery.executeTakeFirst()
    return mapToSCIM(user)
  }

  // if we have startIndex or count we need the total for pagination
  let totalQuery = pg
    .selectFrom('User')
    .select(sql`COUNT(*)`.as('total'))
    .where((eb) =>
      eb.or([
        eb('scimId', '=', scimId),
        eb('domain', '=', eb.fn.any(eb.val(domains))),
        eb('id', '=', eb.fn.any(eb.val(orgUsers)))
      ])
    )
  //.where('isRemoved', '=', false)

  if (startIndex) {
    // 1-based index
    userQuery = userQuery.offset(startIndex - 1)
  }
  if (count) {
    userQuery = userQuery.limit(count)
  }

  if (sortBy && !(sortBy in SortByColumnMap)) {
    throw new SCIMMY.Types.Error(400, 'invalidSort', `Sorting by ${sortBy} is not supported`)
  }

  const orderBy = SortByColumnMap[sortBy as keyof typeof SortByColumnMap] ?? 'createdAt'
  const direction = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc'
  userQuery = userQuery.orderBy(orderBy, direction)

  if (filter) {
    if (filter.length > 1) {
      throw new SCIMMY.Types.Error(400, 'invalidFilter', 'Only a single filter is supported')
    }
    const f = filter[0]
    if (f) {
      const keys = Object.keys(f)
      if (keys.length !== 1) {
        throw new SCIMMY.Types.Error(
          400,
          'invalidFilter',
          'Only a single filter condition is supported'
        )
      }
      for (const key of keys) {
        const filterColumn = FilterColumnMap[key]
        if (!filterColumn) {
          throw new SCIMMY.Types.Error(400, 'invalidFilter', `Filtering by ${key} is not supported`)
        }
        const [op, value] = f[key]
        if (op !== 'eq') {
          throw new SCIMMY.Types.Error(
            400,
            'invalidFilter',
            `Only 'eq' operator is supported for filtering`
          )
        }
        userQuery = userQuery.where((eb) => filterColumn(eb, value))
        totalQuery = totalQuery.where((eb) => filterColumn(eb, value))
      }
    }
  }

  const [users, total] = await Promise.all([userQuery.execute(), totalQuery.executeTakeFirst()])

  const scimUsers = users.map(mapToSCIM)
  // Paginated results need to have a totalResults field. Scimmy determines it by reading the array's length.
  // See https://github.com/scimmyjs/scimmy/issues/85#issuecomment-3698016234
  scimUsers.length = total ? Number(total.total) : users.length
  return scimUsers
})
