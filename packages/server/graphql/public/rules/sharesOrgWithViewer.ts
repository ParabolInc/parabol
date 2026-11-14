import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getRuleViewerId} from '../../../utils/authorization'
import type {RuleContext} from '../../graphql'
import {cacheByDotPath, getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const sharesOrgWithViewer = <T>(userIdDotPath: ResolverDotPath<T>) =>
  rule('sharesOrgWithViewer', {cache: cacheByDotPath(userIdDotPath)})(
    async (source, args, {authToken, dataLoader}: RuleContext) => {
      const userId = getResolverDotPath(userIdDotPath, source, args)
      const viewerId = getRuleViewerId(authToken)
      if (!viewerId)
        return new GraphQLError('Viewer does not share an organization with user', {
          extensions: {code: 'FORBIDDEN'}
        })
      const [viewerOrganizationUsers, userOrganizationUsers] = await Promise.all([
        dataLoader.get('organizationUsersByUserId').load(viewerId),
        dataLoader.get('organizationUsersByUserId').load(userId)
      ])
      const viewerOrgIds = new Set(viewerOrganizationUsers.map(({orgId}) => orgId))
      if (!userOrganizationUsers.some(({orgId}) => viewerOrgIds.has(orgId))) {
        return new GraphQLError('Viewer does not share an organization with user', {
          extensions: {code: 'FORBIDDEN'}
        })
      }
      return true
    }
  )
