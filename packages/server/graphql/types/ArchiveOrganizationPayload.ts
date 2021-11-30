import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

const ArchiveOrganizationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ArchiveOrganizationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    orgId: {
      type: GraphQLID
    },
    teams: {
      type: new GraphQLList(new GraphQLNonNull(Team)),
      resolve: ({teamIds}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').loadMany(teamIds)
      }
    },
    removedSuggestedActionIds: {
      type: new GraphQLList(GraphQLID),
      description: 'all the suggested actions that never happened'
    }
  })
})

export default ArchiveOrganizationPayload
