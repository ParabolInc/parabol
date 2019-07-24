import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'
import User from './User'
import Team from './Team'

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
