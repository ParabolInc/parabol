import {rule} from 'graphql-shield'
import type {Pageroleenum} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import {feistelCipher} from '../../../utils/feistelCipher'
import {GQLContext} from '../../graphql'

export const PAGE_ROLES = ['owner', 'editor', 'commenter', 'viewer'] as const

export const hasPageAccess = (roleRequired: Pageroleenum) =>
  rule(`hasPageAccess-${roleRequired}`, {cache: 'strict'})(
    async (_source, {pageId}, context: GQLContext) => {
      const {authToken, dataLoader} = context
      const viewerId = getUserId(authToken)
      const dbPageId = feistelCipher.decrypt(Number(pageId.split(':')[1]))
      const userRole = await dataLoader
        .get('pageAccessByUserId')
        .load({pageId: dbPageId, userId: viewerId})
      if (!userRole || PAGE_ROLES.indexOf(roleRequired) < PAGE_ROLES.indexOf(userRole)) {
        return new Error(
          `Access denied. User role: ${userRole || 'None'} Role required: ${roleRequired}`
        )
      }
      return true
    }
  )
