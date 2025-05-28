import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {PageAccessResolvers} from '../resolverTypes'

export type PageAccessSource = {
  id: number
}

const PageAccess: PageAccessResolvers = {
  viewer: async ({id}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    const pg = getKysely()
    const access = await pg
      .selectFrom('PageAccess')
      .select('role')
      .where('pageId', '=', id)
      .where('userId', '=', viewerId)
      .executeTakeFirst()
    return access?.role ?? null
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
  }
}

export default PageAccess
