import getKysely from '../../../postgres/getKysely'
import {PageAccessResolvers} from '../resolverTypes'

export type PageAccessSource = {
  id: number
}

const PageAccess: PageAccessResolvers = {
  public: async ({id}) => {
    const pg = getKysely()
    const access = await pg
      .selectFrom('PageExternalAccess')
      .select(['email', 'role'])
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
      .where('email', 'is not', '*')
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
