import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {Pageroleenum} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const PAGE_ROLES = ['owner', 'editor', 'commenter', 'viewer'] as const

type PageChildLoader = 'pageThreads' | 'pageComments'

const getDbPageId = async (
  dbId: number,
  pageChildLoader: PageChildLoader | undefined,
  dataLoader: GQLContext['dataLoader']
) => {
  if (!pageChildLoader) return dbId
  const threadId =
    pageChildLoader === 'pageComments'
      ? (await dataLoader.get('pageComments').load(dbId))?.threadId
      : dbId
  if (!threadId) return null
  const thread = await dataLoader.get('pageThreads').load(threadId)
  return thread?.pageId ?? null
}

export const hasPageAccess = <T>(
  dotPath: ResolverDotPath<T>,
  roleRequired: Pageroleenum,
  // set when the path points at a thread or comment instead of the page that it is on
  pageChildLoader?: PageChildLoader
) =>
  rule(`hasPageAccess-${roleRequired}-${dotPath}-${pageChildLoader ?? ''}`, {cache: 'strict'})(
    async (source, args, context: GQLContext) => {
      const subjectId = getResolverDotPath(dotPath, source, args)
      if (!subjectId) {
        // may access the page if it doesn't exist. e.g. a parentPage where parentPageId is null
        return true
      }
      const {authToken, dataLoader} = context
      const viewerId = getUserId(authToken)
      const dbSubjectId = dotPath.startsWith('source')
        ? subjectId
        : CipherId.fromClient(subjectId)[0]
      const dbPageId = await getDbPageId(dbSubjectId, pageChildLoader, dataLoader)
      if (!dbPageId) {
        return new GraphQLError(`Permission lookup failed on ${pageChildLoader} for ${subjectId}`)
      }
      const userRole = await dataLoader
        .get('pageAccessByPageIdUserId')
        .load({pageId: dbPageId, userId: viewerId})
      if (!userRole || PAGE_ROLES.indexOf(roleRequired) < PAGE_ROLES.indexOf(userRole)) {
        return new GraphQLError(
          `Insufficient permission. User role: ${userRole || 'None'} Role required: ${roleRequired}`
        )
      }
      dataLoader.get('pageAccessByPageIdUserId').clearAll()
      if (context.resourceGrants && !(await context.resourceGrants.hasPage(dbPageId))) {
        return new GraphQLError(`PAT does not grant access to this page`)
      }
      return true
    }
  )
