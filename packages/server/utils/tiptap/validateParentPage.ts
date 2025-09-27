import {GraphQLError} from 'graphql'
import sleep from '../../../client/utils/sleep'
import {MAX_PAGE_DEPTH} from '../../graphql/public/mutations/updatePage'
import {PAGE_ROLES} from '../../graphql/public/rules/hasPageAccess'
import getKysely from '../../postgres/getKysely'
import type {Pageroleenum} from '../../postgres/types/pg'

export const validateParentPage = async (
  parentPageId: number,
  userId: string,
  roleRequired: Pageroleenum,
  attemptNumber?: number
): Promise<{ancestorIds: number[]; isPrivate: boolean; role: Pageroleenum | null}> => {
  const pg = getKysely()
  const parentPageWithRole = await pg
    .selectFrom('Page')
    .leftJoin('PageAccess', (join) =>
      join.onRef('PageAccess.pageId', '=', 'Page.id').on('PageAccess.userId', '=', userId)
    )
    .select(['Page.ancestorIds', 'Page.isPrivate', 'PageAccess.role as role'])
    .where('id', '=', parentPageId)
    .executeTakeFirst()

  if (!parentPageWithRole) {
    throw new GraphQLError('Invalid parentPageId')
  }
  const {ancestorIds, role} = parentPageWithRole
  if (!role) {
    if (!attemptNumber) {
      // access may have been _just_ granted. try again
      await sleep(1000)
      return validateParentPage(parentPageId, userId, roleRequired, 1)
    }
    throw new GraphQLError('Invalid access to parentPageId')
  }
  if (PAGE_ROLES.indexOf(roleRequired) < PAGE_ROLES.indexOf(role)) {
    throw new GraphQLError('Insufficient role on parentPage')
  }

  if (ancestorIds.length >= MAX_PAGE_DEPTH) {
    throw new GraphQLError(`Pages can only be nested ${MAX_PAGE_DEPTH} pages deep`, {
      extensions: {code: 'MAX_PAGE_DEPTH_REACHED'}
    })
  }
  return parentPageWithRole
}
