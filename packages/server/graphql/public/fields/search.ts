import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getEmbeddingsByRRF} from '../../../postgres/queries/getEmbeddingsByRRF'
import {getPagesByRRF} from '../../../postgres/queries/getPagesByRRF'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {getUserQueryJobData, publishToEmbedder} from '../../mutations/helpers/publishToEmbedder'
import type {SearchTypeEnum, UserResolvers} from '../resolverTypes'

const decodeCursor = (after: string | null | undefined, type: SearchTypeEnum) => {
  if (!after) return null
  const decodedAfter = JSON.parse(atob(after))
  if (!decodedAfter) return null
  const {codes, maxScore} = decodedAfter as {codes: (number | string)[]; maxScore: number}
  if (!Array.isArray(codes) || codes.length < 1 || !maxScore) return null
  const afterIds = type === 'page' ? codes.map((code) => CipherId.decrypt(Number(code))) : codes
  return {afterIds, maxScore}
}
export const search: NonNullable<UserResolvers['search']> = async (
  _source,
  {query, after, alpha: inAlpha, dateField, endAt, first, startAt, teamIds, type},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const alpha = inAlpha ?? 0.75

  // VALIDATION
  if (alpha < 0 || alpha > 1) throw new GraphQLError('alpha must be between 0 and 1')
  if (query.length > 5000) throw new GraphQLError('query must be between 1 and 5000 chars')
  if (first < 1 || first > 100) throw new GraphQLError('first must be between 1 and 100')
  if (teamIds) {
    const hasAccessToTeams = teamIds.every((teamId) => authToken.tms.includes(teamId))
    if (!hasAccessToTeams) {
      throw new GraphQLError('Viewer is not a member of all teamIds requested')
    }
  }
  const pg = getKysely()
  const dateRange =
    startAt || endAt
      ? {
          startAt: startAt || new Date(0),
          endAt: endAt || new Date(4000),
          dateField: dateField || 'createdAt'
        }
      : null
  const teamIdsOrDefault = teamIds || ['aGhostTeam', ...authToken.tms]
  const safeTeamIds =
    teamIdsOrDefault.length > 0 ? (teamIdsOrDefault as [string, ...string[]]) : undefined

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
      const results = await pg
        .selectFrom('PageAccess')
        .innerJoin('Page', 'PageAccess.pageId', `Page.id`)
        .where('PageAccess.userId', '=', viewerId)
        .$if(!!dateRange, (qb) =>
          qb.where((eb) => eb.between(dateRange!.dateField, dateRange!.startAt, dateRange!.endAt))
        )
        .$if(!!safeTeamIds, (qb) =>
          qb
            .innerJoin('PageTeamAccess', 'PageTeamAccess.pageId', `Page.id`)
            .where('PageTeamAccess.teamId', 'in', safeTeamIds!)
        )
        .orderBy('Page.updatedAt', 'desc')
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
      const lastEdge = edges.at(-1)
      const endCursor = lastEdge ? CipherId.toClient(lastEdge.nodeId, 'page') : undefined
      return {
        pageInfo: {
          hasNextPage: results.length > first,
          hasPreviousPage: false,
          endCursor,
          startCursor: null
        },
        edges
      }
    }
    const results = await pg
      .selectFrom('EmbeddingsMetadata')
      .$if(!!safeTeamIds, (qb) => qb.where('teamId', 'in', safeTeamIds!))
      .where('EmbeddingsMetadata.objectType', '=', type)
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
          nodeTypeName: page.objectType,
          nodeId: page.refId
        }))
        .slice(0, first)
    }
  }
  const queryVector = await publishToEmbedder({
    jobType: 'userQuery:start',
    dataLoader,
    userId: viewerId,
    data: getUserQueryJobData(query)
  })
  if (queryVector instanceof Error) {
    throw new GraphQLError('Error calling search')
  }
  const k = 60 // RRF constant
  if (type === 'page') {
    return getPagesByRRF({
      query,
      queryVector,
      dateRange,
      after: decodeCursor(after, type),
      alpha,
      k,
      first,
      teamIds: safeTeamIds,
      viewerId
    })
  } else {
    return getEmbeddingsByRRF({
      query,
      queryVector,
      dateRange,
      after: decodeCursor(after, type),
      alpha,
      k,
      first,
      teamIds: safeTeamIds,
      type
    })
  }
}
