import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {PageAccessResolvers} from '../resolverTypes'

export type PageAccessSource = {
  id: number
}

const PageAccess: PageAccessResolvers = {
  viewer: ({id}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('pageGrantByPageIdUserId').load({pageId: id, userId: viewerId})
  },
  public: async ({id}) => {
    const pg = getKysely()
    const access = await pg
      .selectFrom('PageExternalAccess')
      .select('role')
      .where('pageId', '=', id)
      .where('email', '=', '*')
      .executeTakeFirst()
    return access?.role ?? null
  },
  guests: async ({id}) => {
    const pg = getKysely()
    const access = await pg
      .selectFrom('PageExternalAccess')
      .select(['email', 'role'])
      .where('pageId', '=', id)
      .where('email', '!=', '*')
      .execute()
    return access
  },
  users: async ({id}) => {
    const pg = getKysely()
    const access = await pg
      .selectFrom('PageUserAccess')
      .select(['userId', 'role'])
      .where('pageId', '=', id)
      .orderBy('userId') // for deterministic testing
      .execute()
    return access
  },
  teams: async ({id}) => {
    const pg = getKysely()
    const access = await pg
      .selectFrom('PageTeamAccess')
      .select(['teamId', 'role'])
      .where('pageId', '=', id)
      .execute()
    return access
  },
  organizations: async ({id}) => {
    const pg = getKysely()
    const access = await pg
      .selectFrom('PageOrganizationAccess')
      .select(['orgId', 'role'])
      .where('pageId', '=', id)
      .execute()
    return access
  },
  pendingRequests: async ({id}) => {
    const pg = getKysely()
    const requests = await pg
      .selectFrom('PageAccessRequest')
      .selectAll()
      .where('pageId', '=', id)
      .where('createdAt', '>=', sql<Date>`now() - interval '30 days'`)
      .orderBy('createdAt', 'desc')
      .execute()
    return requests
  }
}

export default PageAccess
