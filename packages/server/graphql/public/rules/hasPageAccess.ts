import {rule} from 'graphql-shield'
import type {Pageroleenum} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import {feistelCipher} from '../../../utils/feistelCipher'
import {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const PAGE_ROLES = ['owner', 'editor', 'commenter', 'viewer'] as const

export const hasPageAccess = <T>(dotPath: ResolverDotPath<T>, roleRequired: Pageroleenum) =>
  rule(`hasPageAccess-${roleRequired}`, {cache: 'strict'})(
    async (source, args, context: GQLContext) => {
      const pageId = getResolverDotPath(dotPath, source, args)
      if (!pageId) {
        // may access the page if it doesn't exist. e.g. a parentPage where parentPageId is null
        return true
      }
      const {authToken, dataLoader} = context
      const viewerId = getUserId(authToken)
      const dbPageId = feistelCipher.decrypt(Number(pageId.split(':')[1]))
      const userRole = await dataLoader
        .get('pageAccessByUserId')
        .load({pageId: dbPageId, userId: viewerId})
      if (!userRole || PAGE_ROLES.indexOf(roleRequired) < PAGE_ROLES.indexOf(userRole)) {
        return new Error(
          `Access denied. PageId: ${pageId} User role: ${userRole || 'None'} Role required: ${roleRequired}`
        )
      }
      dataLoader.get('pageAccessByUserId').clearAll()
      return true
    }
  )
