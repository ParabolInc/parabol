import getKysely from '../../postgres/getKysely'

// null means the user may not open the page
export const getPageConnectionAccess = async (pageId: number, userId: string | undefined) => {
  const pg = getKysely()
  const [page, userAccess, publicAccess] = await Promise.all([
    pg.selectFrom('Page').select('isMeetingTOC').where('id', '=', pageId).executeTakeFirst(),
    userId
      ? pg
          .selectFrom('PageAccess')
          .select('role')
          .where('pageId', '=', pageId)
          .where('userId', '=', userId)
          .executeTakeFirst()
      : undefined,
    pg
      .selectFrom('PageExternalAccess')
      .select('role')
      .where('pageId', '=', pageId)
      .where('email', '=', '*')
      .executeTakeFirst()
  ])
  const role = userAccess?.role ?? publicAccess?.role
  if (!page || !role) return null
  return {readOnly: role === 'viewer' || role === 'commenter' || page.isMeetingTOC}
}
