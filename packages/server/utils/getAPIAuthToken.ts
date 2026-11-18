import {GraphQLError} from 'graphql'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {APIGrant} from './getAPIGrant'
import {Logger} from './Logger'
import recordUserActivity from './recordUserActivity'

const getAPIAuthToken = async (grant: APIGrant, dataLoader: DataLoaderWorker) => {
  const {userId, scopes, aud, resourceGrants} = grant
  const [teamMembers, user] = await Promise.all([
    dataLoader.get('teamMembersByUserId').load(userId),
    dataLoader.get('users').load(userId)
  ])
  if (!user || user.isRemoved) {
    throw new GraphQLError('The user of this access token no longer exists', {
      extensions: {code: 'UNAUTHENTICATED'}
    })
  }
  await recordUserActivity(user).catch(Logger.error)
  const memberTeamIds = teamMembers.map(({teamId}: {teamId: string}) => teamId)
  const isTeamGranted = await Promise.all(
    memberTeamIds.map((teamId) => resourceGrants.hasTeam(teamId))
  )
  const tms = memberTeamIds.filter((_, idx) => isTeamGranted[idx])
  return new AuthToken({
    sub: userId,
    tms,
    scope: scopes,
    lifespan_ms: ms('1h'),
    aud
  })
}

export default getAPIAuthToken
