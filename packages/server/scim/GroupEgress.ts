import {ExpressionBuilder, ExpressionWrapper, SqlBool, sql} from 'kysely'
import SCIMMY from 'scimmy'
import getKysely from '../postgres/getKysely'
import {DB} from '../postgres/types/pg'
import {Logger} from '../utils/Logger'
import {mapGroupToSCIM} from './mapToSCIM'
import {SCIMContext} from './SCIMContext'

const SortByColumnMap = {
  createdAt: 'createdAt',
  displayName: 'name'
} as const

type WhereExpressionBuilder = (
  eb: ExpressionBuilder<DB, 'Team'>,
  value: string
) => ExpressionWrapper<DB, 'Team', SqlBool>
const FilterColumnMap: Record<string, WhereExpressionBuilder> = {
  displayName: (eb, value) => eb('name', 'ilike', value)
}

SCIMMY.Resources.declare(SCIMMY.Resources.Group).egress(async (resource, ctx: SCIMContext) => {
  const {authToken, dataLoader} = ctx

  const {id: teamId, constraints, filter} = resource
  const {startIndex, count = 20, sortBy, sortOrder} = constraints ?? {}

  const scimId = authToken.sub!
  const saml = await dataLoader.get('saml').loadNonNull(scimId)
  const {orgId} = saml

  if (teamId) {
    const team = await dataLoader.get('teams').load(teamId)

    if (!team || team.orgId !== orgId || (team.isArchived && !team.scimCreated)) {
      throw new SCIMMY.Types.Error(404, '', 'Team not found')
    }
    return mapGroupToSCIM(team, dataLoader)
  }

  try {
    const pg = getKysely()
    let teamQuery = pg
      .selectFrom('Team')
      .selectAll()
      .where('orgId', '=', orgId)
      .where((eb) => eb.or([eb('isArchived', '=', false), eb('scimCreated', '=', true)]))

    // if we have startIndex or count we need the total for pagination
    let totalQuery = pg
      .selectFrom('Team')
      .select(sql`COUNT(*)`.as('total'))
      .where('orgId', '=', orgId)
      .where((eb) => eb.or([eb('isArchived', '=', false), eb('scimCreated', '=', true)]))

    if (startIndex) {
      // 1-based index
      teamQuery = teamQuery.offset(startIndex - 1)
    }
    if (count) {
      teamQuery = teamQuery.limit(count)
    }

    if (sortBy && !(sortBy in SortByColumnMap)) {
      throw new SCIMMY.Types.Error(400, 'invalidSort', `Sorting by ${sortBy} is not supported`)
    }

    const orderBy = SortByColumnMap[sortBy as keyof typeof SortByColumnMap] ?? 'createdAt'
    const direction = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc'
    teamQuery = teamQuery.orderBy(orderBy, direction)

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
            throw new SCIMMY.Types.Error(
              400,
              'invalidFilter',
              `Filtering by ${key} is not supported`
            )
          }
          const [op, value] = f[key]
          if (op !== 'eq') {
            throw new SCIMMY.Types.Error(
              400,
              'invalidFilter',
              `Only 'eq' operator is supported for filtering`
            )
          }
          teamQuery = teamQuery.where((eb) => filterColumn(eb, value))
          totalQuery = totalQuery.where((eb) => filterColumn(eb, value))
        }
      }
    }

    const [teams, total] = await Promise.all([teamQuery.execute(), totalQuery.executeTakeFirst()])

    const scimTeams = await Promise.all(teams.map((team) => mapGroupToSCIM(team, dataLoader)))
    // Paginated results need to have a totalResults field. Scimmy determines it by reading the array's length.
    // See https://github.com/scimmyjs/scimmy/issues/85#issuecomment-3698016234
    scimTeams.length = total ? Number(total.total) : teams.length
    return scimTeams
  } catch (error) {
    Logger.error('Error fetching teams for SCIM egress', {error})
    throw new SCIMMY.Types.Error(500, '', 'Internal server error')
  }
})
