import {GraphQLError} from 'graphql'
import {MAX_PAGE_DEPTH} from '../../graphql/public/mutations/updatePage'
import getKysely from '../../postgres/getKysely'

export const validateParentPage = async (parentPageId: number, userId: string) => {
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
    throw new GraphQLError('Invalid access to parentPageId')
  }

  if (ancestorIds.length >= MAX_PAGE_DEPTH) {
    throw new GraphQLError(`Pages can only be nested ${MAX_PAGE_DEPTH} pages deep`, {
      extensions: {code: 'MAX_PAGE_DEPTH_REACHED'}
    })
  }
  return parentPageWithRole
}
