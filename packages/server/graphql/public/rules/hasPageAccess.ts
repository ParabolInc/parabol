import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {Pageroleenum} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {GQLContext} from '../../graphql'
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
      const dbPageId = dotPath.startsWith('source') ? pageId : CipherId.fromClient(pageId)[0]
      const userRole = await dataLoader
        .get('pageAccessByUserId')
        .load({pageId: dbPageId, userId: viewerId})
      if (!userRole || PAGE_ROLES.indexOf(roleRequired) < PAGE_ROLES.indexOf(userRole)) {
        return new GraphQLError(
          `Insufficient permission. User role: ${userRole || 'None'} Role required: ${roleRequired}`
        )
      }
      dataLoader.get('pageAccessByUserId').clearAll()
      return true
    }
  )
