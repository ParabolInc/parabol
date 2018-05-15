import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMember from 'server/graphql/types/TeamMember'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const JoinIntegrationPayload = new GraphQLObjectType({
  name: 'JoinIntegrationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    globalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The globalId of the integration with a removed member'
    },
    teamMember: {
      type: new GraphQLNonNull(TeamMember)
    }
  })
})

export default JoinIntegrationPayload
