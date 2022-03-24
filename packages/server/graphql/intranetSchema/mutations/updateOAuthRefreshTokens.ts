import {GraphQLInt, GraphQLNonNull} from 'graphql'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'
import getAtlassianAuthsToUpdate from '../../../postgres/queries/getAtlassianAuthsToUpdate'
import {isNotNull} from 'parabol-client/utils/predicates'
import isNotError from '../../errorFilter'
import GraphQLISO8601Type from '../../types/GraphQLISO8601Type'

interface UpdateOAuthRefreshTokensInput {
  updatedBefore: Date
}

const updateOAuthRefreshTokens = {
  type: GraphQLInt,
  description: `Updates Atlassian OAuth tokens that haven't been updated since the date specified in input`,
  args: {
    updatedBefore: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'Threshold date for `updatedAt` from AtlassianAuth'
    }
  },
  resolve: async (
    _source: unknown,
    {updatedBefore}: UpdateOAuthRefreshTokensInput,
    {authToken, dataLoader}: GQLContext
  ) => {
    //AUTH
    requireSU(authToken)

    // RESOLUTION
    const atlassianAuthsToUpdate = await getAtlassianAuthsToUpdate(updatedBefore)
    const updatedAtlassianAuths = (
      await dataLoader.get('freshAtlassianAuth').loadMany(atlassianAuthsToUpdate)
    ).filter((auth) => isNotNull(auth) && isNotError(auth))

    return updatedAtlassianAuths.length
  }
}

export default updateOAuthRefreshTokens
