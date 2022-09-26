import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

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
