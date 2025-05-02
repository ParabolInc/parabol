import {rule} from 'graphql-shield'
import type {Pageroleenum} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import {feistelCipher} from '../../../utils/feistelCipher'
import {GQLContext} from '../../graphql'

const pageRoles = ['owner', 'editor', 'commenter', 'viewer'] as const
export const hasPageAccess = (role: Pageroleenum) =>
  rule(`hasPageAccess-${role}`, {cache: 'strict'})(
    async (_source, {pageId}, context: GQLContext) => {
      const {authToken, dataLoader} = context
      const viewerId = getUserId(authToken)
      const dbPageId = feistelCipher.decrypt(Number(pageId.split(':')[1]))
      const pageRole = await dataLoader
        .get('pageAccessByUserId')
        .load({pageId: dbPageId, userId: viewerId})
      if (!pageRole || pageRoles.indexOf(role) > pageRoles.indexOf(pageRole)) {
        return new Error(`Access denied. User role: ${pageRole || 'N/A'} Role required: ${role}`)
      }
      return true
    }
  )
