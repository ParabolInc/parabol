import {GraphQLObjectType} from 'graphql'
import Team from './Team'
import {resolveTeam} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const UpdateTeamNamePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTeamNamePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
})

export default UpdateTeamNamePayload
