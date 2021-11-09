import {GraphQLInt} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import getAtlassianAuthsToUpdate from '../../../postgres/queries/getAtlassianAuthsToUpdate'
import {Threshold} from '~/types/constEnums'
import errorFilter from '../../errorFilter'

const updateOAuthRefreshTokens = {
  type: GraphQLInt,
  description: `Updates Atlassian OAuth tokens that haven't been updated for more than 14 days`,
  args: {},
  resolve: async (_source, {}, {authToken, dataLoader}: GQLContext) => {
    //AUTH
    requireSU(authToken)

    // RESOLUTION
    const olderThan14DaysThreshold = new Date(Date.now() - Threshold.OAUTH_REFRESH)
    const atlassianAuthsToUpdate = await getAtlassianAuthsToUpdate(olderThan14DaysThreshold)
    const updatedAtlassianAuths = (
      await dataLoader.get('freshAtlassianAuth').loadMany(atlassianAuthsToUpdate)
    ).filter(errorFilter)

    return updatedAtlassianAuths.length
  }
}

export default updateOAuthRefreshTokens
