import {PAGE_ROLES} from '../graphql/public/rules/hasPageAccess'
import {selectPageAccess} from '../postgres/select'

export const pageAccessByUserIdBatchFn = async (
  keys: readonly {pageId: number; userId: string}[]
) => {
  const pageIds = keys.map((k) => k.pageId)
  const res = await selectPageAccess()
    .where(({eb, refTuple, tuple}) =>
      eb(
        refTuple('pageId', 'userId'),
        'in',
        keys.map((key) => tuple(key.pageId, key.userId))
      )
    )
    .unionAll((eb) =>
      eb.parens(
        eb
          .selectFrom('PageExternalAccess')
          .select(['pageId', eb.val('*').as('userId'), 'role'])
          .where('pageId', 'in', pageIds)
          .where('email', '=', '*')
      )
    )
    .execute()
  const publicRules = res.filter(({userId}) => userId === '*')
  return keys.map((key) => {
    const rule = res.find(({pageId, userId}) => pageId === key.pageId && userId === key.userId)
    const userRole = rule?.role ?? null
    if (userRole === 'owner') return userRole
    const publicRule = publicRules.find((rule) => rule.pageId === key.pageId)
    if (!publicRule) return userRole
    const publicRole = publicRule.role
    if (!userRole) return publicRole
    return PAGE_ROLES.indexOf(userRole) < PAGE_ROLES.indexOf(publicRole) ? userRole : publicRole
  })
}
