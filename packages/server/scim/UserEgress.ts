import {sql} from 'kysely'
import SCIMMY from 'scimmy'
import getKysely from '../postgres/getKysely'
import {User} from '../postgres/types'
import {SCIMContext} from './SCIMContext'

const SortByColumnMap = {
  userName: 'scimUserNameFallback',
  createdAt: 'createdAt'
} as const

const FilterColumnMap = {
  userName: 'scimUserNameFallback',
  email: 'email',
  externalId: 'scimExternalId'
} as const

const ValueConversions = {
  email: (value: string) => value.toLowerCase().trim(),
  userName: (value: string) => value.toLowerCase().trim()
} as const

export const mapToSCIM = (
  user?: Pick<
    User,
    | 'id'
    | 'scimExternalId'
    | 'scimUserNameFallback'
    | 'persistentUserId'
    | 'email'
    | 'preferredName'
  >
) => {
  if (!user) throw new Error('User not found')
  return {
    id: user.id,
    externalId: user.scimExternalId ?? undefined,
    userName: user.scimUserNameFallback!,
    displayName: user.preferredName,
    emails: [
      {
        value: user.email,
        type: 'work',
        primary: true
      }
    ]
  }
}

SCIMMY.Resources.declare(SCIMMY.Resources.User).egress(async (resource, ctx: SCIMContext) => {
  const {authToken, dataLoader} = ctx

  const {id, constraints, filter} = resource

  const {startIndex, count = 20, sortBy, sortOrder} = constraints ?? {}
  console.log('GEORG User egress list filter', resource.filter?.[0])

  const pg = getKysely()

  const scimId = authToken.sub!
  const saml = await dataLoader.get('saml').loadNonNull(scimId)
  const {domains, orgId} = saml

  const orgMembers = await dataLoader.get('organizationUsersByOrgId').load(orgId!)
  const orgUsers = orgMembers.map(({userId}) => userId)

  // if we have startIndex or count we need the total for pagination
  let totalQuery = pg
    .selectFrom('User')
    .select(sql`COUNT(*)`.as('total'))
    .where('isRemoved', '=', false)
    .where((eb) =>
      eb.or([eb('scimId', '=', scimId), eb('domain', 'in', domains), eb('id', 'in', orgUsers)])
    )

  let userQuery = pg
    .selectFrom('User')
    .selectAll()
    .where('isRemoved', '=', false)
    .where((eb) =>
      eb.or([eb('scimId', '=', scimId), eb('domain', 'in', domains), eb('id', 'in', orgUsers)])
    )

  if (id) {
    const user = await userQuery.where('id', '=', id).executeTakeFirst()
    return mapToSCIM(user)
  }

  if (startIndex) {
    // 1-based index
    userQuery = userQuery.offset(startIndex - 1)
  }
  if (count) {
    userQuery = userQuery.limit(count)
  }

  const orderBy = SortByColumnMap[sortBy as keyof typeof SortByColumnMap]
  const direction = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc'
  if (orderBy) {
    userQuery = userQuery.orderBy(orderBy, direction)
  } else {
    userQuery = userQuery.orderBy('createdAt', direction)
  }

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
        const filterColumn = FilterColumnMap[key as keyof typeof FilterColumnMap]
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
        const convert = ValueConversions[key as keyof typeof ValueConversions]
        const convertedValue = convert ? convert(value as string) : value
        userQuery = userQuery.where(filterColumn, '=', convertedValue)
        totalQuery = totalQuery.where(filterColumn, '=', convertedValue)
      }
    }
  }

  const [users, total] = await Promise.all([userQuery.execute(), totalQuery.executeTakeFirst()])

  const scimUsers = users.map(mapToSCIM)
  scimUsers.length = total ? Number(total.total) : users.length
  return scimUsers
})
