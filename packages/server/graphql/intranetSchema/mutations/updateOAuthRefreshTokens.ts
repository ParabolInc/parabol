import {GraphQLInt} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import getAtlassianAuthsToUpdate from '../../../postgres/queries/getAtlassianAuthsToUpdate'
import {Threshold} from '~/types/constEnums'

const updateOAuthRefreshTokens = {
  type: GraphQLInt,
  description: `Forces refresh of Atlassian auth auth/refresh tokens`,
  args: {},
  resolve: async (_source, {}, {authToken, dataLoader}: GQLContext) => {
    //AUTH
    requireSU(authToken)

    // RESOLUTION
    const olderThan14DaysThreshold = new Date(Date.now() - Threshold.OAUTH_REFRESH)
    const atlassianAuthsToUpdate = await getAtlassianAuthsToUpdate(olderThan14DaysThreshold)
    const updatedAtlassianAuths = await dataLoader
      .get('freshAtlassianAuth')
      .loadMany(atlassianAuthsToUpdate)

    return updatedAtlassianAuths.length
  }
}

export default updateOAuthRefreshTokens
