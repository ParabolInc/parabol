import {GraphQLError} from 'graphql'
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
  if (query.length < 1 || query.length > 5000)
    throw new GraphQLError('query must be between 1 and 5000 chars')
  if (first < 1 || first > 100) throw new GraphQLError('first must be between 1 and 100')
  if (teamIds) {
    const hasAccessToTeams = teamIds.every((teamId) => authToken.sub.includes(teamId))
    if (!hasAccessToTeams) {
      throw new GraphQLError('Viewer is not a member of all teamIds requested')
    }
  }

  const queryVector = await publishToEmbedder({
    jobType: 'userQuery:start',
    dataLoader,
    userId: viewerId,
    data: getUserQueryJobData(query)
  })
  const k = 60 // RRF constant
  const dateRange =
    startAt || endAt
      ? {
          startAt: startAt || new Date(0),
          endAt: endAt || new Date(4000),
          dateField: dateField || 'createdAt'
        }
      : null
  if (type === 'page') {
    return getPagesByRRF({
      query,
      queryVector,
      dateRange,
      after: decodeCursor(after, type),
      alpha,
      k,
      first,
      teamIds
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
      teamIds: teamIds || ['aGhostTeam', ...authToken.tms],
      type
    })
  }
}
