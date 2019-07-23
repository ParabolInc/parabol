import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {GQLContext} from 'server/graphql/graphql'
import User from 'server/graphql/types/User'
import Team from 'server/graphql/types/Team'

const PushInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'PushInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    },
    team: {
      type: Team,
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

export default PushInvitationPayload
