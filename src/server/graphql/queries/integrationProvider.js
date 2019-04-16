import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import Provider from 'server/graphql/types/Provider'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {SLACK} from 'universal/utils/constants'
import IntegrationServiceEnum from 'server/graphql/types/IntegrationServiceEnum'
import standardError from 'server/utils/standardError'

export default {
  type: Provider,
  description: 'get an integration provider belonging to the user',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team member Id'
    },
    service: {
      type: new GraphQLNonNull(IntegrationServiceEnum),
      description: 'The name of the service'
    }
  },
  resolve: async (source, {teamId, service}, {authToken}) => {
    const r = getRethink()

    // AUTH
    const userId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      standardError(new Error('Team not found'), {userId})
      return null
    }

    // RESOLUTION
    return r
      .table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({service, isActive: true})
      .filter((doc) =>
        doc('service')
          .eq(SLACK)
          .or(doc('userId').eq(userId))
      )
      .nth(0)
      .default(null)
  }
}
