import {GraphQLError} from 'graphql'
import {RRF_K} from '../../../postgres/expressions'
import getKysely from '../../../postgres/getKysely'
import {getEmbeddingsByRRF} from '../../../postgres/queries/getEmbeddingsByRRF'
import {getPagesByKeyword} from '../../../postgres/queries/getPagesByKeyword'
import {getPagesByRRF} from '../../../postgres/queries/getPagesByRRF'
import {
  decodePageSearchCursor,
  getPageSearchPageInfo
} from '../../../postgres/queries/pageSearchCursor'
import {getUserId} from '../../../utils/authorization'
import {EmbeddingTimeoutError} from '../../../utils/EmbeddingTimeoutError'
import {Logger} from '../../../utils/Logger'
import {getUserQueryJobData, publishToEmbedder} from '../../mutations/helpers/publishToEmbedder'
import type {SearchTypeEnum, UserResolvers} from '../resolverTypes'

export const SEARCH_EMBEDDING_TIMEOUT_MS = 3000
export const KEYWORD_FALLBACK_LOG_MESSAGE = 'Page search used keyword results'
const EMBEDDING_TIMED_OUT = 'timed out'

const embedWithinBudget = async (embed: () => Promise<Float32Array | Error | undefined>) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timedOut = new Promise<typeof EMBEDDING_TIMED_OUT>((resolve) => {
    timer = setTimeout(() => resolve(EMBEDDING_TIMED_OUT), SEARCH_EMBEDDING_TIMEOUT_MS)
  })
  try {
    return await Promise.race([embed(), timedOut])
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error))
  } finally {
    clearTimeout(timer)
  }
}

const PAGE_SEARCH_CURSOR_ERROR = 'after must be an endCursor from the same page search'

const getPageSearchCursor = (after: string | null | undefined) => {
  if (!after) return null
  const cursor = decodePageSearchCursor(after)
  if (!cursor) throw new GraphQLError(PAGE_SEARCH_CURSOR_ERROR)
  return cursor
}

const decodeCursor = (after: string | null | undefined) => {
  if (!after) return null
  const decodedAfter = JSON.parse(atob(after))
  if (!decodedAfter) return null
  const {codes, maxScore} = decodedAfter as {codes: (number | string)[]; maxScore: number}
  if (!Array.isArray(codes) || codes.length < 1 || !maxScore) return null
  return {afterIds: codes, maxScore}
}
export const search: NonNullable<UserResolvers['search']> = async (
  _source,
  {
    query: inQuery,
    after,
    alpha: inAlpha,
    dateField,
    endAt,
    first,
    startAt,
    teamIds: inTeamIds,
    type
  },
  {authToken, dataLoader, resourceGrants}
) => {
  const viewerId = getUserId(authToken)
  const alpha = inAlpha ?? 0.25
  const query = inQuery.trim()

  // VALIDATION
  if (alpha < 0 || alpha > 1) throw new GraphQLError('alpha must be between 0 and 1')
  if (query.length > 5000) throw new GraphQLError('query must be between 1 and 5000 chars')
  if (first < 1 || first > 100) throw new GraphQLError('first must be between 1 and 100')
  if (inTeamIds) {
    const hasAccessToTeams = inTeamIds.every((teamId) => authToken.tms.includes(teamId))
    if (!hasAccessToTeams) {
      throw new GraphQLError('Viewer is not a member of all teamIds requested')
    }
  }
  const pageCursor = type === 'page' ? getPageSearchCursor(after) : null
  const pageOffset = pageCursor?.position ?? 0
  let teamIds = inTeamIds
  if (resourceGrants) {
    const baseTeamIds = teamIds ?? authToken.tms
    const grantChecks = await Promise.all(baseTeamIds.map((id) => resourceGrants.hasTeam(id)))
    teamIds = baseTeamIds.filter((_, i) => grantChecks[i])
  }
  const pg = getKysely()
  const dateRange =
    startAt || endAt
      ? {
          startAt: startAt || new Date(0),
          endAt: endAt || new Date('9999-12-31T23:59:59.999Z'),
          dateField: dateField || 'createdAt'
        }
      : null
  // if teamIds is defined for pages, it will limit the search to team pages
  const pageTeamIds = teamIds && teamIds.length > 0 ? (teamIds as [string, ...string[]]) : undefined
  // metadata requires a teamId, whereas pages don't because it uses RBAC
  const metadataTeamIds: [string, ...string[]] = resourceGrants
    ? ['aGhostTeam', ...(teamIds ?? [])]
    : (pageTeamIds ?? ['aGhostTeam', ...authToken.tms])

  if (query.length === 0) {
    const noQueryEdge = {
      score: {
        keyword: 0,
        vector: 0,
        vectorRank: 0,
        keywordRank: 0,
        combined: 0
      },
      snippets: []
    }
    // show most recent for that user
    if (type === 'page') {
      if (pageCursor && pageCursor.ranking !== 'recent') {
        throw new GraphQLError(PAGE_SEARCH_CURSOR_ERROR)
      }
      const results = await pg
        .selectFrom('PageAccess')
        .innerJoin('Page', 'PageAccess.pageId', `Page.id`)
        .where('PageAccess.userId', '=', viewerId)
        .where('Page.deletedAt', 'is', null)
        .$if(!!dateRange, (qb) =>
          qb.where((eb) => eb.between(dateRange!.dateField, dateRange!.startAt, dateRange!.endAt))
        )
        .$if(!!pageTeamIds, (qb) =>
          qb.where((eb) =>
            eb.exists(
              eb
                .selectFrom('PageTeamAccess')
                .select('PageTeamAccess.pageId')
                .whereRef('PageTeamAccess.pageId', '=', 'Page.id')
                .where('PageTeamAccess.teamId', 'in', pageTeamIds!)
            )
          )
        )
        .orderBy('Page.updatedAt', 'desc')
        .orderBy('Page.id', 'desc')
        .offset(pageOffset)
        .limit(first + 1)
        .select('Page.id')
        .execute()
      const edges = results
        .map((page) => ({
          ...noQueryEdge,
          nodeTypeName: 'page' as const,
          nodeId: page.id
        }))
        .slice(0, first)
      return {
        pageInfo: getPageSearchPageInfo('recent', pageOffset, edges.length, results.length > first),
        edges
      }
    }
    const results = await pg
      .selectFrom('EmbeddingsMetadata')
      .where('EmbeddingsMetadata.objectType', '=', type)
      .$if(!!metadataTeamIds, (qb) => qb.where('teamId', 'in', metadataTeamIds!))
      .$if(!!dateRange, (qb) =>
        qb
          // we don't update discussion topics, so we only use refUpdatedAt
          .where((eb) => eb.between('refUpdatedAt', dateRange!.startAt, dateRange!.endAt))
      )
      .select(['refId', 'fullText', 'objectType'])
      .execute()
    return {
      pageInfo: {
        hasNextPage: results.length > first,
        hasPreviousPage: false,
        endCursor: results.at(-1)?.refId,
        startCursor: null
      },
      edges: results
        .map((page) => ({
          ...noQueryEdge,
          nodeTypeName: page.objectType as SearchTypeEnum,
          nodeId: page.refId
        }))
        .slice(0, first)
    }
  }
  if (type === 'page') {
    if (pageCursor?.ranking === 'recent' || (alpha === 0 && pageCursor?.ranking === 'fused')) {
      throw new GraphQLError(PAGE_SEARCH_CURSOR_ERROR)
    }
    const getKeywordResults = () =>
      getPagesByKeyword({
        query,
        first,
        offset: pageOffset,
        viewerId,
        teamIds: pageTeamIds,
        dateRange
      })
    if (alpha === 0 || pageCursor?.ranking === 'keyword') return getKeywordResults()
    const fallBackToKeyword = (reason: string, error?: unknown) => {
      const extras = {reason, errorMessage: error instanceof Error ? error.message : undefined}
      if (pageCursor) {
        Logger.warn('Page search could not continue fused results', {userId: viewerId, extras})
        throw new GraphQLError('Page search could not rank this page. Retry the request.')
      }
      Logger.warn(KEYWORD_FALLBACK_LOG_MESSAGE, {userId: viewerId, extras})
      return getKeywordResults()
    }
    const queryVector = await embedWithinBudget(() =>
      publishToEmbedder({
        jobType: 'userQuery:start',
        dataLoader,
        userId: viewerId,
        data: getUserQueryJobData(query, SEARCH_EMBEDDING_TIMEOUT_MS)
      })
    )
    if (queryVector === undefined) return getKeywordResults()
    if (queryVector === EMBEDDING_TIMED_OUT || queryVector instanceof EmbeddingTimeoutError) {
      return fallBackToKeyword('embedding timed out')
    }
    if (queryVector instanceof Error) return fallBackToKeyword('embedding failed', queryVector)
    try {
      return await getPagesByRRF({
        query,
        queryVector,
        dateRange,
        alpha,
        k: RRF_K,
        first,
        offset: pageOffset,
        teamIds: pageTeamIds,
        viewerId
      })
    } catch (error) {
      return fallBackToKeyword('fused ranking failed', error)
    }
  }
  const queryVector = await publishToEmbedder({
    jobType: 'userQuery:start',
    dataLoader,
    userId: viewerId,
    data: getUserQueryJobData(query)
  })
  if (!queryVector || queryVector instanceof Error) {
    throw new GraphQLError('Error calling search')
  }
  return getEmbeddingsByRRF({
    query,
    queryVector,
    dateRange,
    after: decodeCursor(after),
    alpha,
    k: RRF_K,
    first,
    teamIds: metadataTeamIds,
    type
  })
}
